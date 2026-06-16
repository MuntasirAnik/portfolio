import fs from "fs";
import path from "path";

const CONTENT_PATH = path.join(process.cwd(), "data", "content.json");

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
  };
  testimonials: {
    name: string;
    role: string;
    company: string;
    text: string;
    image: string;
  }[];
}

export function readContent(): SiteContent {
  const raw = fs.readFileSync(CONTENT_PATH, "utf-8");
  return JSON.parse(raw);
}

export function writeContent(data: SiteContent): void {
  const dir = path.dirname(CONTENT_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(CONTENT_PATH, JSON.stringify(data, null, 2), "utf-8");
}
