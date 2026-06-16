import type { NextApiRequest, NextApiResponse } from "next";
import { checkPassword, setAuthCookie } from "@/lib/auth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { password } = req.body;

  if (!password || !checkPassword(password)) {
    return res.status(401).json({ error: "Invalid password" });
  }

  setAuthCookie(res);
  return res.status(200).json({ success: true });
}
