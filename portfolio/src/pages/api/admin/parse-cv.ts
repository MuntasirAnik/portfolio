import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm, File } from "formidable";
import fs from "fs";
import { parseCV } from "@/lib/cvParser";

// Disable body parser for file uploads
export const config = {
  api: { bodyParser: false },
};

async function extractTextFromPDF(filePath: string): Promise<string> {
  const { PDFParse } = require("pdf-parse");
  const buffer = fs.readFileSync(filePath);
  const pdf = new PDFParse({ data: new Uint8Array(buffer) });
  const result = await pdf.getText();
  await pdf.destroy();
  return result.text;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check admin auth
  const token = req.cookies.admin_token;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const form = new IncomingForm({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true,
    });

    const { files, fields } = await new Promise<{ files: Record<string, File[]>; fields: Record<string, string[]> }>(
      (resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          else resolve({ files: files as Record<string, File[]>, fields: fields as Record<string, string[]> });
        });
      }
    );

    // Check if raw text was sent (from client-side OCR)
    const rawText = fields.text?.[0];
    if (rawText) {
      const parsed = parseCV(rawText);
      return res.status(200).json({ text: rawText, parsed });
    }

    // Handle file upload
    const fileArray = files.cv || files.file;
    if (!fileArray || fileArray.length === 0) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = fileArray[0];
    const mimeType = file.mimetype || "";

    let extractedText = "";

    if (mimeType === "application/pdf") {
      extractedText = await extractTextFromPDF(file.filepath);
    } else {
      return res.status(400).json({
        error: "Unsupported file type. Upload a PDF, or use an image (JPG/PNG) which will be processed in the browser.",
      });
    }

    // Clean up temp file
    try { fs.unlinkSync(file.filepath); } catch {}

    if (!extractedText.trim()) {
      return res.status(400).json({ error: "Could not extract text from file. It may be a scanned PDF — try uploading as an image instead." });
    }

    const parsed = parseCV(extractedText);
    return res.status(200).json({ text: extractedText, parsed });
  } catch (error) {
    console.error("CV parsing error:", error);
    return res.status(500).json({ error: "Failed to parse CV" });
  }
}
