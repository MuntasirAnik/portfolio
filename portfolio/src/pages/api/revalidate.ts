import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";

/**
 * Post-save hook endpoint.
 * With getServerSideProps, no ISR revalidation is needed — pages always
 * fetch fresh data. This endpoint exists so the admin panel call doesn't break.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!verifyAuth(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // No revalidation needed — getServerSideProps fetches fresh data on every request
  return res.status(200).json({ success: true });
}
