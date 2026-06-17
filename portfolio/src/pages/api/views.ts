import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { readJsonBlob, writeJsonBlob } from "@/lib/blob-storage";

const VIEWS_PATH = path.join(process.cwd(), "data", "views.json");
const BLOB_NAME = "data/views.json";

interface ViewsData {
  total: number;
  today: number;
  date: string;
}

const DEFAULT_VIEWS: ViewsData = { total: 0, today: 0, date: "" };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const views = await readJsonBlob<ViewsData>(BLOB_NAME, VIEWS_PATH, DEFAULT_VIEWS);
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

    // Persist — works on both local fs and Vercel Blob
    try {
      await writeJsonBlob(BLOB_NAME, VIEWS_PATH, views);
    } catch {}

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
