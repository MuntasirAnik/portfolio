import fs from "fs";
import path from "path";

const SETTINGS_PATH = path.join(process.cwd(), "data", "settings.json");

export interface SiteSettings {
  siteEnabled: boolean;
  customCursor: boolean;
}

function ensureFile() {
  if (!fs.existsSync(SETTINGS_PATH)) {
    const dir = path.dirname(SETTINGS_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify({ siteEnabled: true, customCursor: true }, null, 2), "utf-8");
  }
}

export function readSettings(): SiteSettings {
  ensureFile();
  try {
    const raw = fs.readFileSync(SETTINGS_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { siteEnabled: true, customCursor: true };
  }
}

export function writeSettings(data: SiteSettings): void {
  ensureFile();
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(data, null, 2), "utf-8");
}
