import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

const TOKEN_COOKIE = "admin_token";
const TOKEN_MAX_AGE = 60 * 60 * 24; // 24 hours

/**
 * Auth using HMAC-signed tokens stored in cookies.
 * No server-side storage needed — works on Vercel's read-only filesystem.
 * The token format is: timestamp.signature
 */

function getSecret(): string {
  return process.env.ADMIN_PASSWORD || "fallback-secret-key";
}

function createSignedToken(): string {
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(timestamp)
    .digest("hex");
  return `${timestamp}.${signature}`;
}

function verifySignedToken(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [timestamp, signature] = parts;
  const ts = parseInt(timestamp, 10);
  if (isNaN(ts)) return false;

  // Check expiry
  if (Date.now() - ts > TOKEN_MAX_AGE * 1000) return false;

  // Verify signature
  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(timestamp)
    .digest("hex");

  const sigBuf = Buffer.from(signature, "hex");
  const expBuf = Buffer.from(expected, "hex");

  if (sigBuf.length !== expBuf.length) return false;
  return crypto.timingSafeEqual(
    new Uint8Array(sigBuf),
    new Uint8Array(expBuf)
  );
}

export function verifyAuth(req: NextApiRequest): boolean {
  const cookie = req.cookies[TOKEN_COOKIE];
  if (!cookie) return false;
  return verifySignedToken(cookie);
}

export function verifyAuthFromCookieString(cookieHeader: string | undefined): boolean {
  if (!cookieHeader) return false;
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [key, ...rest] = c.trim().split("=");
      return [key, rest.join("=")];
    })
  );
  const token = cookies[TOKEN_COOKIE];
  if (!token) return false;
  return verifySignedToken(token);
}

export function setAuthCookie(res: NextApiResponse): void {
  const token = createSignedToken();
  res.setHeader(
    "Set-Cookie",
    `${TOKEN_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${TOKEN_MAX_AGE}`
  );
}

export function clearAuthCookie(res: NextApiResponse): void {
  res.setHeader(
    "Set-Cookie",
    `${TOKEN_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`
  );
}

export function checkPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  return password === adminPassword;
}
