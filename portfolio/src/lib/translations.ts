export type Lang = "en" | "bn";

const translations = {
  // Navbar
  "nav.about": { en: "About", bn: "পরিচিতি" },
  "nav.experience": { en: "Experience", bn: "অভিজ্ঞতা" },
  "nav.projects": { en: "Projects", bn: "প্রকল্প" },
  "nav.opensource": { en: "Open Source", bn: "ওপেন সোর্স" },
  "nav.contact": { en: "Contact", bn: "যোগাযোগ" },

  // Hero
  "hero.download": { en: "Download Resume", bn: "জীবনবৃত্তান্ত ডাউনলোড" },
  "hero.contact": { en: "Get in Touch", bn: "যোগাযোগ করুন" },

  // About
  "about.title": { en: "About", bn: "পরিচিতি" },
  "about.subtitle": { en: "A bit about my background.", bn: "আমার সম্পর্কে কিছু কথা।" },

  // Experience
  "exp.title": { en: "Experience", bn: "অভিজ্ঞতা" },
  "exp.subtitle": { en: "Where I've worked and what I know.", bn: "আমি কোথায় কাজ করেছি এবং আমি কী জানি।" },
  "exp.work": { en: "Work", bn: "কর্মজীবন" },
  "exp.education": { en: "Education", bn: "শিক্ষা" },
  "exp.technologies": { en: "Technologies", bn: "প্রযুক্তি" },

  // Projects
  "projects.title": { en: "Projects", bn: "প্রকল্প" },
  "projects.subtitle": { en: "A selection of things I've built.", bn: "আমার তৈরি কিছু প্রকল্প।" },

  // GitHub
  "github.title": { en: "Open Source", bn: "ওপেন সোর্স" },
  "github.subtitle": { en: "My contributions on GitHub.", bn: "গিটহাবে আমার অবদান।" },
  "github.stars": { en: "Stars", bn: "স্টার" },
  "github.repos": { en: "Repos", bn: "রিপো" },
  "github.viewOnGithub": { en: "View on GitHub →", bn: "গিটহাবে দেখুন →" },
  "github.viewProfile": { en: "View GitHub Profile →", bn: "গিটহাব প্রোফাইল দেখুন →" },

  // Publication
  "pub.title": { en: "Publication", bn: "প্রকাশনা" },
  "pub.subtitle": { en: "Research I've contributed to.", bn: "আমার গবেষণা অবদান।" },
  "pub.readLink": { en: "Read on Springer →", bn: "স্প্রিংগারে পড়ুন →" },

  // Contact
  "contact.sayHello": { en: "Say Hello", bn: "হ্যালো বলুন" },

  // Footer
  "footer.rights": { en: "All rights reserved.", bn: "সর্বস্বত্ব সংরক্ষিত।" },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Lang): string {
  return translations[key]?.[lang] ?? translations[key]?.["en"] ?? key;
}

export default translations;
