/**
 * CV Text Parser
 * Extracts structured portfolio data from raw CV text
 */

export interface ParsedCV {
  name: string;
  title: string;
  bio: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  experience: Array<{
    position: string;
    company: string;
    time: string;
  }>;
  education: Array<{
    degree: string;
    place: string;
    time: string;
  }>;
  skills: string[];
}

// Section header patterns
const SECTION_PATTERNS: Record<string, RegExp> = {
  experience: /^(?:work\s+)?(?:experience|employment|work\s+history|professional\s+experience)/i,
  education: /^(?:education|academic|qualifications|degrees)/i,
  skills: /^(?:skills|technical\s+skills|technologies|competencies|proficiencies|expertise)/i,
  summary: /^(?:summary|objective|profile|about\s*(?:me)?|professional\s+summary)/i,
  contact: /^(?:contact|personal\s+(?:info|information|details))/i,
  projects: /^(?:projects|portfolio|notable\s+projects)/i,
  certifications: /^(?:certifications?|licenses?|credentials)/i,
  publications: /^(?:publications?|papers?|research)/i,
};

// Date patterns: "Jan 2021 - Present", "2019-2022", "March 2020 – Current"
const DATE_RANGE_PATTERN = /(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+)?\d{4}\s*[-–—to]+\s*(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+)?\d{4}|(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+)?\d{4}\s*[-–—to]+\s*(?:Present|Current|Now|Ongoing)/i;

const EMAIL_PATTERN = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const PHONE_PATTERN = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/;
const LINKEDIN_PATTERN = /(?:linkedin\.com\/in\/[\w-]+|linkedin\.com\/[\w-]+)/i;
const GITHUB_PATTERN = /(?:github\.com\/[\w-]+)/i;

// Common job title patterns
const TITLE_KEYWORDS = [
  "software engineer", "developer", "programmer", "architect",
  "designer", "manager", "analyst", "consultant", "lead",
  "senior", "junior", "full.?stack", "front.?end", "back.?end",
  "devops", "data scientist", "ml engineer", "qa", "tester",
];

export function parseCV(text: string): ParsedCV {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const sections = splitIntoSections(lines);

  const result: ParsedCV = {
    name: extractName(lines),
    title: extractTitle(lines, sections),
    bio: extractBio(sections),
    email: extractPattern(text, EMAIL_PATTERN) || "",
    phone: extractPattern(text, PHONE_PATTERN) || "",
    linkedin: extractLinkedIn(text),
    github: extractGitHub(text),
    experience: extractExperience(sections),
    education: extractEducation(sections),
    skills: extractSkills(sections, text),
  };

  return result;
}

function extractPattern(text: string, pattern: RegExp): string | null {
  const match = text.match(pattern);
  return match ? match[0] : null;
}

function extractLinkedIn(text: string): string {
  const match = text.match(LINKEDIN_PATTERN);
  if (match) {
    const url = match[0];
    return url.startsWith("http") ? url : `https://${url}`;
  }
  return "";
}

function extractGitHub(text: string): string {
  const match = text.match(GITHUB_PATTERN);
  if (match) {
    const url = match[0];
    return url.startsWith("http") ? url : `https://${url}`;
  }
  return "";
}

function extractName(lines: string[]): string {
  // Name is typically the first non-empty, non-contact line
  for (const line of lines.slice(0, 5)) {
    // Skip lines that look like contact info
    if (EMAIL_PATTERN.test(line) || PHONE_PATTERN.test(line)) continue;
    if (LINKEDIN_PATTERN.test(line) || GITHUB_PATTERN.test(line)) continue;
    if (/^(address|phone|email|tel|mobile)/i.test(line)) continue;

    // Name is usually short (2-4 words), all alpha
    const words = line.replace(/[^a-zA-Z\s.]/g, "").trim().split(/\s+/);
    if (words.length >= 2 && words.length <= 5 && words.every((w) => /^[A-Z]/.test(w))) {
      return line.replace(/[|•·,]/g, "").trim();
    }

    // Fallback: first line that's reasonably short
    if (line.length < 40 && !isSectionHeader(line)) {
      return line;
    }
  }
  return "";
}

function extractTitle(lines: string[], sections: Record<string, string[]>): string {
  // Check lines near the top for job title patterns
  for (const line of lines.slice(0, 8)) {
    const lower = line.toLowerCase();
    for (const keyword of TITLE_KEYWORDS) {
      if (new RegExp(keyword, "i").test(lower) && line.length < 60) {
        return line;
      }
    }
  }

  // Fallback: first position from experience
  if (sections.experience?.length) {
    const exp = parseExperienceBlock(sections.experience);
    if (exp.length > 0) return exp[0].position;
  }

  return "";
}

function extractBio(sections: Record<string, string[]>): string {
  if (sections.summary?.length) {
    return sections.summary
      .filter((l) => !isSectionHeader(l))
      .join(" ")
      .trim();
  }
  return "";
}

function isSectionHeader(line: string): boolean {
  return Object.values(SECTION_PATTERNS).some((p) => p.test(line));
}

function splitIntoSections(lines: string[]): Record<string, string[]> {
  const sections: Record<string, string[]> = {};
  let currentSection = "header";
  sections[currentSection] = [];

  for (const line of lines) {
    let matched = false;
    for (const [name, pattern] of Object.entries(SECTION_PATTERNS)) {
      if (pattern.test(line)) {
        currentSection = name;
        sections[currentSection] = [];
        matched = true;
        break;
      }
    }
    if (!matched) {
      if (!sections[currentSection]) sections[currentSection] = [];
      sections[currentSection].push(line);
    }
  }

  return sections;
}

function extractExperience(sections: Record<string, string[]>): ParsedCV["experience"] {
  if (!sections.experience?.length) return [];
  return parseExperienceBlock(sections.experience);
}

function parseExperienceBlock(lines: string[]): ParsedCV["experience"] {
  const entries: ParsedCV["experience"] = [];
  let current: { position: string; company: string; time: string } | null = null;

  for (const line of lines) {
    const dateMatch = line.match(DATE_RANGE_PATTERN);

    if (dateMatch) {
      // This line has a date — could be start of new entry
      const textBeforeDate = line.replace(DATE_RANGE_PATTERN, "").replace(/[|•·,\-–—]/g, " ").trim();

      if (current) {
        entries.push(current);
      }

      // Try to split "Position at Company" or "Company - Position"
      const parts = splitPositionCompany(textBeforeDate);
      current = {
        position: parts.position || textBeforeDate,
        company: parts.company || "",
        time: dateMatch[0].trim(),
      };
    } else if (current) {
      // Additional line — might be company name or description
      if (!current.company && line.length < 80 && !line.startsWith("•") && !line.startsWith("-")) {
        current.company = line.replace(/[|•·]/g, "").trim();
      }
    } else if (line.length < 80 && !line.startsWith("•") && !line.startsWith("-")) {
      // First line before any date — might be position/company
      current = { position: line, company: "", time: "" };
    }
  }

  if (current && (current.position || current.company)) {
    entries.push(current);
  }

  return entries;
}

function splitPositionCompany(text: string): { position: string; company: string } {
  // "Position at Company" or "Position, Company"
  const atMatch = text.match(/^(.+?)\s+(?:at|@)\s+(.+)$/i);
  if (atMatch) return { position: atMatch[1].trim(), company: atMatch[2].trim() };

  const commaMatch = text.match(/^(.+?)\s*[,|]\s*(.+)$/);
  if (commaMatch) return { position: commaMatch[1].trim(), company: commaMatch[2].trim() };

  return { position: text, company: "" };
}

function extractEducation(sections: Record<string, string[]>): ParsedCV["education"] {
  if (!sections.education?.length) return [];

  const entries: ParsedCV["education"] = [];
  let current: { degree: string; place: string; time: string } | null = null;

  for (const line of sections.education) {
    const dateMatch = line.match(DATE_RANGE_PATTERN);

    if (dateMatch) {
      const textBeforeDate = line.replace(DATE_RANGE_PATTERN, "").replace(/[|•·,\-–—]/g, " ").trim();

      if (current) entries.push(current);

      current = {
        degree: textBeforeDate || "",
        place: "",
        time: dateMatch[0].trim(),
      };
    } else if (current) {
      if (!current.place && line.length < 100 && !line.startsWith("•")) {
        current.place = line.replace(/[|•·]/g, "").trim();
      } else if (!current.degree) {
        current.degree = line;
      }
    } else {
      current = { degree: line, place: "", time: "" };
    }
  }

  if (current && (current.degree || current.place)) {
    entries.push(current);
  }

  return entries;
}

function extractSkills(sections: Record<string, string[]>, fullText: string): string[] {
  let skillText = "";

  if (sections.skills?.length) {
    skillText = sections.skills.join(" ");
  }

  if (!skillText) {
    // Try to find skills from the full text
    skillText = fullText;
  }

  // Common tech skills to look for
  const KNOWN_SKILLS = [
    "JavaScript", "TypeScript", "Python", "Java", "C#", "C\\+\\+", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin",
    "React", "Angular", "Vue", "Next\\.js", "Nuxt", "Svelte", "Node\\.js", "Express", "NestJS", "Django", "Flask", "Spring",
    "HTML", "CSS", "SASS", "SCSS", "Tailwind", "Bootstrap",
    "\\.NET", "ASP\\.NET", "Laravel", "Rails",
    "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Firebase", "Supabase",
    "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Git", "CI/CD", "Jenkins",
    "REST", "GraphQL", "gRPC", "WebSocket",
    "TensorFlow", "PyTorch", "Machine Learning", "Deep Learning", "AI",
    "Figma", "Adobe", "Photoshop",
    "Agile", "Scrum", "Jira",
  ];

  const found: string[] = [];
  for (const skill of KNOWN_SKILLS) {
    const pattern = new RegExp(`\\b${skill}\\b`, "i");
    if (pattern.test(skillText)) {
      // Get the actual casing from the text
      const match = skillText.match(pattern);
      if (match) {
        const normalized = KNOWN_SKILLS.find((s) => new RegExp(`^${s}$`, "i").test(match[0]));
        const displayName = normalized?.replace(/\\\+/g, "+").replace(/\\\./g, ".") || match[0];
        if (!found.includes(displayName)) {
          found.push(displayName);
        }
      }
    }
  }

  // Also extract comma/bullet-separated items from skills section
  if (sections.skills?.length) {
    for (const line of sections.skills) {
      const items = line.split(/[,•·|;]/).map((s) => s.trim()).filter((s) => s.length > 1 && s.length < 30);
      for (const item of items) {
        if (!found.some((f) => f.toLowerCase() === item.toLowerCase())) {
          found.push(item);
        }
      }
    }
  }

  return found.slice(0, 20); // Limit to 20 skills
}
