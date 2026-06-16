import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { readSettings, writeSettings } from "@/lib/settings";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET is public — used by _app.js to check site status
  if (req.method === "GET") {
    const settings = readSettings();
    return res.status(200).json(settings);
  }

  // PUT requires admin auth
  if (req.method === "PUT") {
    if (!verifyAuth(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const current = readSettings();
      const { siteEnabled, customCursor } = req.body;
      const updated = { ...current };

      if (typeof siteEnabled === "boolean") updated.siteEnabled = siteEnabled;
      if (typeof customCursor === "boolean") updated.customCursor = customCursor;

      writeSettings(updated);
      return res.status(200).json({ success: true, ...updated });
    } catch {
      return res.status(500).json({ error: "Failed to update settings" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
