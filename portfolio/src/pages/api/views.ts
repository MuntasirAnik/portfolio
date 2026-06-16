import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const VIEWS_PATH = path.join(process.cwd(), "data", "views.json");

interface ViewsData {
  total: number;
  today: number;
  date: string;
}

function readViews(): ViewsData {
  try {
    const raw = fs.readFileSync(VIEWS_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { total: 0, today: 0, date: "" };
  }
}

function writeViews(data: ViewsData): void {
  fs.writeFileSync(VIEWS_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const views = readViews();
  const today = new Date().toISOString().slice(0, 10);

  // Reset daily counter if new day
  if (views.date !== today) {
    views.today = 0;
    views.date = today;
  }

  // Check cookie to avoid double-counting
  const counted = req.cookies["_vc"];

  if (!counted) {
    views.total += 1;
    views.today += 1;
    writeViews(views);

    // Set cookie for 24h
    res.setHeader(
      "Set-Cookie",
      `_vc=1; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`
    );
  }

  return res.status(200).json({
    total: views.total,
    today: views.today,
  });
}
