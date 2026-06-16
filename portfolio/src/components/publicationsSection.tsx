import React from "react";
import { motion } from "framer-motion";
import type { SiteContent } from "@/lib/content";
import { useLanguage } from "@/hooks/useLanguage";

const ease = [0.25, 0.1, 0.25, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease },
  }),
};

const PublicationsSection: React.FC<{ content: SiteContent }> = ({ content }) => {
  const { publication } = content;
  const { t } = useLanguage();

  return (
    <section className="section-white py-10 md:py-8">
      <div className="max-w-[980px] mx-auto px-6">
        <motion.h2
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          custom={0} variants={fadeUp}
          className="section-accent text-[40px] font-bold tracking-[-0.02em] text-center mb-4 md:text-3xl sm:text-2xl"
          style={{ color: "var(--text)" }}
        >
          {t("pub.title")}
        </motion.h2>
        <motion.p
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          custom={1} variants={fadeUp}
          className="text-xl text-center mb-8 md:text-lg sm:text-base"
          style={{ color: "var(--text-tertiary)" }}
        >
          {t("pub.subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.15, ease }}
          className="max-w-[680px] mx-auto"
        >
          <a href={publication.link} target="_blank" rel="noopener noreferrer" className="block group pub-card">
            <h3
              className="text-xl font-semibold transition-colors mb-3 md:text-lg"
              style={{ color: "var(--text)" }}
            >
              <span className="group-hover:underline" style={{ textDecorationColor: "var(--blue)" }}>
                {publication.title}
              </span>
            </h3>
            <p className="text-base mb-4 md:text-sm" style={{ color: "var(--text-tertiary)" }}>
              {publication.publisher}
            </p>
            {publication.about && (
              <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
                {publication.about}
              </p>
            )}
            <span className="link-blue text-sm font-medium">{t("pub.readLink")}</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default PublicationsSection;
