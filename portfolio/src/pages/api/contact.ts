import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

const MESSAGES_PATH = path.join(process.cwd(), "data", "messages.json");

export interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  read: boolean;
}

function readMessages(): Message[] {
  try {
    const raw = fs.readFileSync(MESSAGES_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeMessages(messages: Message[]): void {
  const dir = path.dirname(MESSAGES_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(MESSAGES_PATH, JSON.stringify(messages, null, 2), "utf-8");
}

async function sendEmailNotification(msg: Message) {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.CONTACT_EMAIL;

  if (!host || !user || !pass || !to) {
    console.log("SMTP not configured — skipping email notification");
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"Portfolio Contact" <${user}>`,
    to,
    replyTo: msg.email,
    subject: `New message from ${msg.name}`,
    text: `Name: ${msg.name}\nEmail: ${msg.email}\n\n${msg.message}`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1d1d1f; font-size: 20px;">New Contact Message</h2>
        <div style="background: #f5f5f7; border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="margin: 0 0 8px;"><strong>From:</strong> ${msg.name}</p>
          <p style="margin: 0 0 8px;"><strong>Email:</strong> <a href="mailto:${msg.email}">${msg.email}</a></p>
          <p style="margin: 16px 0 0; color: #1d1d1f; white-space: pre-wrap;">${msg.message}</p>
        </div>
        <p style="color: #86868b; font-size: 12px;">Sent from your portfolio contact form</p>
      </div>
    `,
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { name, email, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (typeof name !== "string" || name.length > 200) {
      return res.status(400).json({ error: "Invalid name" });
    }

    if (typeof email !== "string" || !email.includes("@") || email.length > 200) {
      return res.status(400).json({ error: "Invalid email" });
    }

    if (typeof message !== "string" || message.length > 5000) {
      return res.status(400).json({ error: "Message too long" });
    }

    const newMessage: Message = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      createdAt: new Date().toISOString(),
      read: false,
    };

    try {
      // Save to JSON
      const messages = readMessages();
      messages.unshift(newMessage);
      writeMessages(messages);

      // Send email notification (non-blocking — don't fail the form if email fails)
      sendEmailNotification(newMessage).catch((err) => {
        console.error("Email notification failed:", err);
      });

      return res.status(200).json({ success: true });
    } catch {
      return res.status(500).json({ error: "Failed to save message" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
