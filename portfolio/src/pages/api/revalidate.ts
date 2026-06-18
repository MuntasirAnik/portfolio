import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";

/**
 * On-demand ISR revalidation endpoint.
 * Called after admin content saves to immediately regenerate static pages
 * instead of waiting for the revalidate timer (1 hour).
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!verifyAuth(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Revalidate the home page (the only page using getStaticProps)
    await res.revalidate("/");
    return res.status(200).json({ revalidated: true });
  } catch (err: any) {
    // If revalidation fails, return an error but don't block the save
    return res.status(500).json({
      error: "Failed to revalidate",
      details: err?.message || String(err),
    });
  }
}
