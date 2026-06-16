import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import fs from "fs";
import path from "path";
import { IncomingForm, File as FormidableFile } from "formidable";

export const config = {
  api: { bodyParser: false },
};

const CV_DIR = path.join(process.cwd(), "public");
const CV_FILENAME = "Muntasir.pdf";
const CV_PATH = path.join(CV_DIR, CV_FILENAME);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!verifyAuth(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // GET — check if CV exists
  if (req.method === "GET") {
    const exists = fs.existsSync(CV_PATH);
    let size = 0;
    let lastModified = "";
    if (exists) {
      const stat = fs.statSync(CV_PATH);
      size = stat.size;
      lastModified = stat.mtime.toISOString();
    }
    return res.status(200).json({ exists, filename: CV_FILENAME, size, lastModified });
  }

  // DELETE — remove the CV file
  if (req.method === "DELETE") {
    try {
      if (fs.existsSync(CV_PATH)) {
        fs.unlinkSync(CV_PATH);
      }
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

      // Replace existing CV
      if (fs.existsSync(CV_PATH)) {
        fs.unlinkSync(CV_PATH);
      }
      fs.copyFileSync(file.filepath, CV_PATH);
      try { fs.unlinkSync(file.filepath); } catch {}

      const stat = fs.statSync(CV_PATH);
      return res.status(200).json({
        success: true,
        filename: CV_FILENAME,
        size: stat.size,
        lastModified: stat.mtime.toISOString(),
      });
    } catch {
      return res.status(500).json({ error: "Upload failed" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
