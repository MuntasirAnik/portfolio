import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/lib/auth";
import { list, put, getDownloadUrl } from "@vercel/blob";

/**
 * Debug endpoint to diagnose Vercel Blob read/write issues.
 * GET /api/admin/debug-blob — runs a full diagnostic.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!verifyAuth(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    env: {
      VERCEL: process.env.VERCEL || "(not set)",
      hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
      blobTokenPrefix: process.env.BLOB_READ_WRITE_TOKEN?.substring(0, 20) + "...",
      NODE_ENV: process.env.NODE_ENV,
    },
  };

  // Step 1: List existing blobs
  try {
    const blobList = await list({ prefix: "data/" });
    results.listBlobs = {
      success: true,
      count: blobList.blobs.length,
      blobs: blobList.blobs.map((b) => ({
        pathname: b.pathname,
        size: b.size,
        uploadedAt: b.uploadedAt,
        url: b.url.substring(0, 80) + "...",
      })),
    };
  } catch (err: any) {
    results.listBlobs = { success: false, error: err?.message || String(err) };
  }

  // Step 2: Try writing a test blob
  const testData = { test: true, timestamp: Date.now() };
  try {
    const blob = await put("data/_debug_test.json", JSON.stringify(testData), {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    results.writeTest = {
      success: true,
      url: blob.url.substring(0, 80) + "...",
      pathname: blob.pathname,
    };
  } catch (err: any) {
    results.writeTest = { success: false, error: err?.message || String(err) };
  }

  // Step 3: Try reading the test blob back
  try {
    const blobList = await list({ prefix: "data/_debug_test.json" });
    const found = blobList.blobs.find((b) => b.pathname === "data/_debug_test.json");
    if (found) {
      const downloadUrl = getDownloadUrl(found.url);
      const fetchRes = await fetch(downloadUrl);
      if (fetchRes.ok) {
        const readBack = await fetchRes.json();
        results.readTest = {
          success: true,
          dataMatches: readBack.timestamp === testData.timestamp,
          readData: readBack,
        };
      } else {
        results.readTest = {
          success: false,
          error: `Fetch failed: ${fetchRes.status} ${fetchRes.statusText}`,
          downloadUrl: downloadUrl.substring(0, 80) + "...",
        };
      }
    } else {
      results.readTest = { success: false, error: "Blob not found after write" };
    }
  } catch (err: any) {
    results.readTest = { success: false, error: err?.message || String(err) };
  }

  // Step 4: Try reading the actual content blob
  try {
    const blobList = await list({ prefix: "data/content.json" });
    const found = blobList.blobs.find((b) => b.pathname === "data/content.json");
    if (found) {
      const downloadUrl = getDownloadUrl(found.url);
      const fetchRes = await fetch(downloadUrl);
      if (fetchRes.ok) {
        const content = await fetchRes.json();
        results.contentBlob = {
          success: true,
          heroName: content?.hero?.name || "(empty)",
          blobSize: found.size,
          uploadedAt: found.uploadedAt,
        };
      } else {
        results.contentBlob = {
          success: false,
          error: `Fetch failed: ${fetchRes.status} ${fetchRes.statusText}`,
        };
      }
    } else {
      results.contentBlob = {
        success: false,
        error: "data/content.json blob does not exist",
      };
    }
  } catch (err: any) {
    results.contentBlob = { success: false, error: err?.message || String(err) };
  }

  return res.status(200).json(results);
}
