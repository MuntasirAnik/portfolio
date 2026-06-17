import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { readContent, writeContent } from "@/lib/content";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!verifyAuth(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    try {
      const content = await readContent();
      return res.status(200).json(content);
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to read content", details: err?.message || String(err) });
    }
  }

  if (req.method === "PUT") {
    try {
      const data = req.body;
      await writeContent(data);
      return res.status(200).json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to write content", details: err?.message || String(err) });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
