import { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { readContent, SiteContent } from "@/lib/content";
import { useLanguage } from "@/hooks/useLanguage";
import AboutSection from "@/components/aboutSection";
import Experience from "@/components/experience";
import Education from "@/components/education";
import ProjectsSection from "@/components/projectsSection";
import PublicationsSection from "@/components/publicationsSection";
import ContactSection from "@/components/contactSection";
import GitHubSection from "@/components/githubSection";
import TypingAnimation from "@/components/typingAnimation";
import type { GitHubData } from "@/pages/api/github";

const ease = [0.25, 0.1, 0.25, 1];

interface HomeProps {
  content: SiteContent;
  githubData: GitHubData | null;
}

export async function getServerSideProps() {
  const content = readContent();

  // Fetch GitHub data server-side
  let githubData: GitHubData | null = null;
  try {
    const res = await fetch(
      `https://api.github.com/users/${content.github.username}/repos?sort=updated&per_page=30&type=owner`,
      { headers: { Accept: "application/vnd.github.v3+json", "User-Agent": "portfolio-site" } }
    );
    if (res.ok) {
      const repos = await res.json();
      const sorted = repos
        .filter((r: any) => !r.name.includes(".github"))
        .sort((a: any, b: any) => b.stargazers_count - a.stargazers_count)
        .slice(0, 6);
      githubData = {
        repos: sorted.map((r: any) => ({
          name: r.name,
          description: r.description || "No description",
          url: r.html_url,
          stars: r.stargazers_count,
          forks: r.forks_count,
          language: r.language || "—",
        })),
        totalStars: repos.reduce((sum: number, r: any) => sum + r.stargazers_count, 0),
        totalRepos: repos.length,
      };
    }
  } catch {}

  return { props: { content, githubData } };
}

export default function Home({ content, githubData }: HomeProps) {
  const { hero, social, profileImages } = content;
  const { t } = useLanguage();

  // Track page view
  useEffect(() => {
    fetch("/api/views").catch(() => {});
  }, []);

  return (
    <>
      <Head>
        <title>{`${hero.name} — ${hero.title}`}</title>
        <meta name="description" content={hero.description} />
      </Head>

      {/* ===== HERO ===== */}
      <section id="hero" className="section-white pt-24 pb-10 md:pt-18 md:pb-8 relative overflow-hidden">
        {/* Animated gradient blobs */}
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />
        <div className="hero-blob hero-blob-3" />
        <div className="max-w-[980px] mx-auto px-6 relative z-10">
          <div className="flex items-center gap-12 lg:flex-col-reverse lg:gap-8 lg:text-center">
            <motion.div
              className="flex-1"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.13, delayChildren: 0.2 } },
              }}
            >
              {/* Availability Badge */}
              {content.availability && (
                <motion.div
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22,1,0.36,1] } } }}
                  className="mb-4 lg:flex lg:justify-center"
                >
                  <span
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: content.availability.status === "available"
                        ? "rgba(52, 199, 89, 0.1)" : "rgba(255, 69, 58, 0.1)",
                      color: content.availability.status === "available"
                        ? "#34c759" : "#ff453a",
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{
                        backgroundColor: content.availability.status === "available"
                          ? "#34c759" : "#ff453a",
                      }}
                    />
                    {content.availability.text}
                  </span>
                </motion.div>
              )}

              <motion.h1
                variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22,1,0.36,1] } } }}
                className="text-[56px] font-bold leading-[1.05] tracking-[-0.03em] xl:text-5xl md:text-4xl sm:text-3xl"
                style={{ color: "var(--text)" }}
              >
                {hero.name}.
              </motion.h1>

              <motion.div
                variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22,1,0.36,1] } } }}
                className="text-[56px] font-bold leading-[1.05] tracking-[-0.03em] xl:text-5xl md:text-4xl sm:text-3xl"
                style={{ color: "var(--text-secondary)" }}
              >
                <TypingAnimation roles={hero.roles || [hero.title]} />
              </motion.div>

              <motion.p
                variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22,1,0.36,1] } } }}
                className="mt-4 text-xl leading-relaxed max-w-md lg:mx-auto md:text-lg sm:text-base"
                style={{ color: "var(--text-tertiary)" }}
              >
                {hero.description}
              </motion.p>

              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22,1,0.36,1] } } }}
                className="mt-6 flex items-center gap-4 lg:justify-center flex-wrap"
              >
                <Link href="/Muntasir.pdf" target="_blank" className="btn-apple">
                  {t("hero.download")}
                </Link>
                <a href={`mailto:${social.email}`} className="btn-apple-outline">
                  {t("hero.contact")}
                </a>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.88, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.22,1,0.36,1] }}
              className="flex-shrink-0"
            >
              <div className="profile-glow relative w-[280px] h-[280px] rounded-[2rem] overflow-hidden xl:w-60 xl:h-60 md:w-52 md:h-52">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={profileImages.hero} alt={hero.name} className="w-full h-full object-cover" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <AboutSection content={content} />
      <Experience content={content} />
      <Education />
      <ProjectsSection content={content} />
      <PublicationsSection content={content} />
      <ContactSection content={content} />
    </>
  );
}
