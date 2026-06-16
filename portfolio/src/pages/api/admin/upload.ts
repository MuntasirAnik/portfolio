import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import fs from "fs";
import path from "path";
import { IncomingForm, File as FormidableFile } from "formidable";

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

  const uploadDir = path.join(process.cwd(), "public", "images", "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = new IncomingForm({
    uploadDir,
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

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const ext = path.extname(file.originalFilename || ".png");
    const newName = `${Date.now()}${ext}`;
    const newPath = path.join(uploadDir, newName);

    fs.renameSync(file.filepath, newPath);

    return res.status(200).json({
      url: `/images/uploads/${newName}`,
    });
  } catch (err) {
    return res.status(500).json({ error: "Upload failed" });
  }
}
