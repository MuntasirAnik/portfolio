import { put, del, head, list } from "@vercel/blob";
import fs from "fs";
import path from "path";

/**
 * Storage abstraction layer.
 *
 * - When on Vercel (VERCEL env is set) → uses Vercel Blob (requires BLOB_READ_WRITE_TOKEN).
 * - Otherwise (local dev) → uses local filesystem as before.
 */

function isVercel(): boolean {
  return !!process.env.VERCEL;
}

export function isUsingBlob(): boolean {
  return isVercel() || !!process.env.BLOB_READ_WRITE_TOKEN;
}

// ─── JSON helpers ────────────────────────────────────────────────────────────

/**
 * Read a JSON blob. Falls back to local file, then to `fallback`.
 * On first production read, seeds the blob from the bundled local file if it exists.
 */
export async function readJsonBlob<T>(
  blobName: string,
  localPath: string,
  fallback: T
): Promise<T> {
  if (!isUsingBlob()) {
    // Local dev — use filesystem
    try {
      const raw = fs.readFileSync(localPath, "utf-8");
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  // Production — try Vercel Blob
  try {
    const blobList = await list({ prefix: blobName });
    const existing = blobList.blobs.find((b) => b.pathname === blobName);
    if (existing) {
      const res = await fetch(existing.url);
      if (res.ok) {
        return (await res.json()) as T;
      }
    }
  } catch {
    // Blob read failed — fall through to local seed
  }

  // Blob doesn't exist yet — try to seed from bundled local file
  try {
    const raw = fs.readFileSync(localPath, "utf-8");
    const data = JSON.parse(raw) as T;
    // Seed the blob for future reads
    await writeJsonBlob(blobName, localPath, data);
    return data;
  } catch {
    return fallback;
  }
}

/**
 * Write a JSON blob. Also writes locally in dev mode.
 */
export async function writeJsonBlob<T>(
  blobName: string,
  localPath: string,
  data: T
): Promise<void> {
  const json = JSON.stringify(data, null, 2);

  if (!isUsingBlob()) {
    // Local dev — use filesystem
    const dir = path.dirname(localPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(localPath, json, "utf-8");
    return;
  }

  // Production — write to Vercel Blob
  await put(blobName, json, {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });
}

// ─── File helpers ────────────────────────────────────────────────────────────

/**
 * Upload a file to Vercel Blob (production) or local filesystem (dev).
 * Returns the URL/path where the file is accessible.
 */
export async function uploadFileBlob(
  blobName: string,
  localDir: string,
  fileName: string,
  content: Buffer,
  contentType?: string
): Promise<string> {
  if (!isUsingBlob()) {
    // Local dev — save to filesystem
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    const filePath = path.join(localDir, fileName);
    fs.writeFileSync(filePath, content);
    // Return a relative URL for local usage
    const relativePath = path.relative(
      path.join(process.cwd(), "public"),
      filePath
    );
    return `/${relativePath.replace(/\\/g, "/")}`;
  }

  // Production — upload to Vercel Blob
  const blob = await put(blobName, content, {
    access: "public",
    contentType: contentType || "application/octet-stream",
    addRandomSuffix: false,
  });
  return blob.url;
}

/**
 * Delete a file from Vercel Blob (production) or local filesystem (dev).
 */
export async function deleteFileBlob(
  blobName: string,
  localPath: string
): Promise<void> {
  if (!isUsingBlob()) {
    // Local dev
    try {
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
    } catch {}
    return;
  }

  // Production — delete from Vercel Blob
  try {
    const blobList = await list({ prefix: blobName });
    const existing = blobList.blobs.find((b) => b.pathname === blobName);
    if (existing) {
      await del(existing.url);
    }
  } catch {}
}

/**
 * Check if a file exists in Vercel Blob (production) or local filesystem (dev).
 * Returns metadata if it exists, null otherwise.
 */
export async function checkFileBlob(
  blobName: string,
  localPath: string
): Promise<{ exists: boolean; size: number; lastModified: string; url?: string }> {
  if (!isUsingBlob()) {
    // Local dev
    const exists = fs.existsSync(localPath);
    if (!exists) return { exists: false, size: 0, lastModified: "" };
    const stat = fs.statSync(localPath);
    return {
      exists: true,
      size: stat.size,
      lastModified: stat.mtime.toISOString(),
    };
  }

  // Production — check Vercel Blob
  try {
    const blobList = await list({ prefix: blobName });
    const existing = blobList.blobs.find((b) => b.pathname === blobName);
    if (existing) {
      return {
        exists: true,
        size: existing.size,
        lastModified: new Date(existing.uploadedAt).toISOString(),
        url: existing.url,
      };
    }
  } catch {}
  return { exists: false, size: 0, lastModified: "" };
}
