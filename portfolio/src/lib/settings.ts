import path from "path";
import { readJsonBlob, writeJsonBlob } from "./blob-storage";

const SETTINGS_PATH = path.join(process.cwd(), "data", "settings.json");
const BLOB_NAME = "data/settings.json";

export interface SiteSettings {
  siteEnabled: boolean;
  customCursor: boolean;
}

const DEFAULT_SETTINGS: SiteSettings = { siteEnabled: true, customCursor: true };

export async function readSettings(): Promise<SiteSettings> {
  return readJsonBlob<SiteSettings>(BLOB_NAME, SETTINGS_PATH, DEFAULT_SETTINGS);
}

export async function writeSettings(data: SiteSettings): Promise<void> {
  return writeJsonBlob(BLOB_NAME, SETTINGS_PATH, data);
}
