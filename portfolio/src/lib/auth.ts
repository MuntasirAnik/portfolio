import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const TOKEN_COOKIE = "admin_token";
const TOKEN_MAX_AGE = 60 * 60 * 24; // 24 hours
const TOKEN_FILE = path.join(process.cwd(), "data", ".admin_token");

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Persist token to file so it survives server restarts / hot reloads
function readToken(): string | null {
  try {
    if (!fs.existsSync(TOKEN_FILE)) return null;
    const data = JSON.parse(fs.readFileSync(TOKEN_FILE, "utf-8"));
    // Check if token has expired
    if (data.expiresAt && Date.now() > data.expiresAt) {
      fs.unlinkSync(TOKEN_FILE);
      return null;
    }
    return data.token || null;
  } catch {
    return null;
  }
}

function writeToken(token: string): void {
  const dir = path.dirname(TOKEN_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    TOKEN_FILE,
    JSON.stringify({ token, expiresAt: Date.now() + TOKEN_MAX_AGE * 1000 }),
    "utf-8"
  );
}

function deleteToken(): void {
  try {
    if (fs.existsSync(TOKEN_FILE)) fs.unlinkSync(TOKEN_FILE);
  } catch {}
}

export function verifyAuth(req: NextApiRequest): boolean {
  const cookie = req.cookies[TOKEN_COOKIE];
  const validToken = readToken();
  if (!cookie || !validToken) return false;
  return cookie === validToken;
}

export function verifyAuthFromCookieString(cookieHeader: string | undefined): boolean {
  const validToken = readToken();
  if (!cookieHeader || !validToken) return false;
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [key, ...rest] = c.trim().split("=");
      return [key, rest.join("=")];
    })
  );
  return cookies[TOKEN_COOKIE] === validToken;
}

export function setAuthCookie(res: NextApiResponse): void {
  const token = generateToken();
  writeToken(token);
  res.setHeader(
    "Set-Cookie",
    `${TOKEN_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${TOKEN_MAX_AGE}`
  );
}

export function clearAuthCookie(res: NextApiResponse): void {
  deleteToken();
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
