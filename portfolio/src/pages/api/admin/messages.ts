import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { verifyAuth } from "@/lib/auth";
import { readJsonBlob, writeJsonBlob } from "@/lib/blob-storage";
import type { Message } from "@/pages/api/contact";

const MESSAGES_PATH = path.join(process.cwd(), "data", "messages.json");
const BLOB_NAME = "data/messages.json";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!verifyAuth(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    const messages = await readJsonBlob<Message[]>(BLOB_NAME, MESSAGES_PATH, []);
    return res.status(200).json(messages);
  }

  // Mark message as read
  if (req.method === "PUT") {
    const { id, read } = req.body;
    const messages = await readJsonBlob<Message[]>(BLOB_NAME, MESSAGES_PATH, []);
    const msg = messages.find((m) => m.id === id);
    if (msg) {
      msg.read = read;
      await writeJsonBlob(BLOB_NAME, MESSAGES_PATH, messages);
    }
    return res.status(200).json({ success: true });
  }

  // Delete message
  if (req.method === "DELETE") {
    const { id } = req.body;
    const allMessages = await readJsonBlob<Message[]>(BLOB_NAME, MESSAGES_PATH, []);
    const filtered = allMessages.filter((m) => m.id !== id);
    await writeJsonBlob(BLOB_NAME, MESSAGES_PATH, filtered);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
