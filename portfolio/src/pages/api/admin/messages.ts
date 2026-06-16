import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import fs from "fs";
import path from "path";
import type { Message } from "@/pages/api/contact";

const MESSAGES_PATH = path.join(process.cwd(), "data", "messages.json");

function readMessages(): Message[] {
  try {
    const raw = fs.readFileSync(MESSAGES_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeMessages(messages: Message[]): void {
  fs.writeFileSync(MESSAGES_PATH, JSON.stringify(messages, null, 2), "utf-8");
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!verifyAuth(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    return res.status(200).json(readMessages());
  }

  // Mark message as read
  if (req.method === "PUT") {
    const { id, read } = req.body;
    const messages = readMessages();
    const msg = messages.find((m) => m.id === id);
    if (msg) {
      msg.read = read;
      writeMessages(messages);
    }
    return res.status(200).json({ success: true });
  }

  // Delete message
  if (req.method === "DELETE") {
    const { id } = req.body;
    const messages = readMessages().filter((m) => m.id !== id);
    writeMessages(messages);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
