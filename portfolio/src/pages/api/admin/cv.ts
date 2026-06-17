import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import fs from "fs";
import path from "path";
import { IncomingForm, File as FormidableFile } from "formidable";
import {
  uploadFileBlob,
  deleteFileBlob,
  checkFileBlob,
} from "@/lib/blob-storage";

export const config = {
  api: { bodyParser: false },
};

const CV_DIR = path.join(process.cwd(), "public");
const CV_FILENAME = "Muntasir.pdf";
const CV_PATH = path.join(CV_DIR, CV_FILENAME);
const BLOB_NAME = `cv/${CV_FILENAME}`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!verifyAuth(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // GET — check if CV exists
  if (req.method === "GET") {
    const info = await checkFileBlob(BLOB_NAME, CV_PATH);
    return res.status(200).json({
      exists: info.exists,
      filename: CV_FILENAME,
      size: info.size,
      lastModified: info.lastModified,
      ...(info.url ? { url: info.url } : {}),
    });
  }

  // DELETE — remove the CV file
  if (req.method === "DELETE") {
    try {
      await deleteFileBlob(BLOB_NAME, CV_PATH);
      return res.status(200).json({ success: true });
    } catch {
      return res.status(500).json({ error: "Failed to delete CV" });
    }
  }

  // POST — upload new CV
  if (req.method === "POST") {
    const form = new IncomingForm({
      maxFileSize: 10 * 1024 * 1024,
      keepExtensions: true,
    });

    try {
      const { files } = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          else resolve({ fields, files });
        });
      });

      const file: FormidableFile = Array.isArray(files.cv) ? files.cv[0] : files.cv;
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const mime = file.mimetype || "";
      if (mime !== "application/pdf") {
        try { fs.unlinkSync(file.filepath); } catch {}
        return res.status(400).json({ error: "Only PDF files are accepted" });
      }

      // Read temp file into buffer
      const fileBuffer = fs.readFileSync(file.filepath);

      // Delete old CV first
      await deleteFileBlob(BLOB_NAME, CV_PATH);

      // Upload new CV
      const url = await uploadFileBlob(
        BLOB_NAME,
        CV_DIR,
        CV_FILENAME,
        fileBuffer,
        "application/pdf"
      );

      // Clean up temp file
      try { fs.unlinkSync(file.filepath); } catch {}

      const info = await checkFileBlob(BLOB_NAME, CV_PATH);
      return res.status(200).json({
        success: true,
        filename: CV_FILENAME,
        size: info.size,
        lastModified: info.lastModified,
        ...(info.url ? { url: info.url } : {}),
      });
    } catch {
      return res.status(500).json({ error: "Upload failed" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
