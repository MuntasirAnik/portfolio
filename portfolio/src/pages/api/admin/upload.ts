import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import path from "path";
import fs from "fs";
import { IncomingForm, File as FormidableFile } from "formidable";
import { uploadFileBlob, isUsingBlob } from "@/lib/blob-storage";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!verifyAuth(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Parse the uploaded file using formidable (writes to /tmp by default)
  const form = new IncomingForm({
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
  });

  try {
    const { files } = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const file: FormidableFile = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const ext = path.extname(file.originalFilename || ".png");
    const newName = `${Date.now()}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "images", "uploads");
    const blobName = `images/uploads/${newName}`;

    // Read the temp file into a buffer
    const fileBuffer = fs.readFileSync(file.filepath);

    // Upload via blob-storage abstraction
    const url = await uploadFileBlob(
      blobName,
      uploadDir,
      newName,
      fileBuffer,
      file.mimetype || undefined
    );

    // Clean up temp file
    try { fs.unlinkSync(file.filepath); } catch {}

    return res.status(200).json({ url });
  } catch (err) {
    return res.status(500).json({ error: "Upload failed" });
  }
}
