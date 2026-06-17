import path from "path";
import { readJsonBlob, writeJsonBlob } from "./blob-storage";

const CONTENT_PATH = path.join(process.cwd(), "data", "content.json");
const BLOB_NAME = "data/content.json";

export interface SiteContent {
  hero: {
    name: string;
    title: string;
    roles: string[];
    description: string;
  };
  about: {
    bio: string[];
    stats: { value: string; label: string }[];
  };
  experience: {
    position: string;
    company: string;
    companyLink: string;
    time: string;
  }[];
  education: {
    degree: string;
    place: string;
    time: string;
  }[];
  skills: {
    name: string;
    level: number;
  }[];
  projects: {
    title: string;
    description: string;
    tech: string;
    image: string;
    link: string;
  }[];
  publication: {
    title: string;
    publisher: string;
    about: string;
    link: string;
  };
  contact: {
    headline: string;
    description: string;
  };
  social: {
    linkedin: string;
    github: string;
    email: string;
    extra: { label: string; url: string }[];
  };
  profileImages: {
    hero: string;
    about: string;
  };
  github: {
    username: string;
  };
  availability: {
    status: "available" | "unavailable";
    text: string;
    icon?: string;
  };
  testimonials: {
    name: string;
    role: string;
    company: string;
    text: string;
    image: string;
  }[];
}

const DEFAULT_CONTENT: SiteContent = {
  hero: { name: "", title: "", roles: [], description: "" },
  about: { bio: [], stats: [] },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  publication: { title: "", publisher: "", about: "", link: "" },
  contact: { headline: "", description: "" },
  social: { linkedin: "", github: "", email: "", extra: [] },
  profileImages: { hero: "", about: "" },
  github: { username: "" },
  availability: { status: "available", text: "" },
  testimonials: [],
};

export async function readContent(): Promise<SiteContent> {
  return readJsonBlob<SiteContent>(BLOB_NAME, CONTENT_PATH, DEFAULT_CONTENT);
}

export async function writeContent(data: SiteContent): Promise<void> {
  return writeJsonBlob(BLOB_NAME, CONTENT_PATH, data);
}
