import React from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import type { GitHubData } from "@/pages/api/github";

const ease = [0.25, 0.1, 0.25, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease },
  }),
};

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

const GitHubSection: React.FC<{ data: GitHubData | null; username: string }> = ({ data, username }) => {
  const { t } = useLanguage();

  if (!data) return null;

  return (
    <section id="github" className="section-white py-24 md:py-16">
      <div className="max-w-[980px] mx-auto px-6">
        <motion.h2
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          custom={0} variants={fadeUp}
          className="text-[40px] font-bold tracking-[-0.02em] text-center mb-4 md:text-3xl sm:text-2xl"
          style={{ color: "var(--text)" }}
        >
          {t("github.title")}
        </motion.h2>
        <motion.p
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          custom={1} variants={fadeUp}
          className="text-xl text-center mb-6 md:text-lg sm:text-base"
          style={{ color: "var(--text-tertiary)" }}
        >
          {t("github.subtitle")}
        </motion.p>

        {/* Stats */}
        <motion.div
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          custom={2} variants={fadeUp}
          className="flex justify-center gap-16 mb-16 md:gap-10"
        >
          <div className="text-center">
            <div className="text-[48px] font-bold tracking-tight md:text-4xl" style={{ color: "var(--text)" }}>
              {data.totalRepos}
            </div>
            <div className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              {t("github.repos")}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[48px] font-bold tracking-tight md:text-4xl" style={{ color: "var(--text)" }}>
              {data.totalStars}
            </div>
            <div className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              {t("github.stars")}
            </div>
          </div>
        </motion.div>

        {/* Repos */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={container}
          className="grid grid-cols-2 gap-4 lg:grid-cols-1"
        >
          {data.repos.map((repo) => (
            <motion.a
              key={repo.name}
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              variants={item}
              className="block rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 group md:p-5"
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-base font-semibold group-hover:underline md:text-sm" style={{ color: "var(--blue)" }}>
                  {repo.name}
                </h3>
                <div className="flex items-center gap-1 flex-shrink-0" style={{ color: "var(--text-secondary)" }}>
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span className="text-xs">{repo.stars}</span>
                </div>
              </div>
              <p className="text-sm leading-relaxed mb-3 line-clamp-2 md:text-xs" style={{ color: "var(--text-secondary)" }}>
                {repo.description}
              </p>
              <span
                className="inline-block px-2.5 py-1 text-xs font-medium rounded-full"
                style={{ backgroundColor: "var(--bg-alt)", color: "var(--text-tertiary)" }}
              >
                {repo.language}
              </span>
            </motion.a>
          ))}
        </motion.div>

        {/* View Profile Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.3, ease }}
          className="text-center mt-10"
        >
          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="link-blue text-sm font-medium"
          >
            {t("github.viewProfile")}
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default GitHubSection;
