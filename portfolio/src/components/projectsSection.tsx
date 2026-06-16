import React from "react";
import Image from "next/image";
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

const ProjectsSection: React.FC<{ content: SiteContent }> = ({ content }) => {
  const { projects } = content;
  const { t } = useLanguage();

  return (
    <section id="projects" className="section-gray py-10 md:py-8">
      <div className="max-w-[980px] mx-auto px-6">
        <motion.h2
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          custom={0} variants={fadeUp}
          className="section-accent text-[40px] font-bold tracking-[-0.02em] text-center mb-4 md:text-3xl sm:text-2xl"
          style={{ color: "var(--text)" }}
        >
          {t("projects.title")}
        </motion.h2>
        <motion.p
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          custom={1} variants={fadeUp}
          className="text-xl text-center mb-8 md:text-lg sm:text-base"
          style={{ color: "var(--text-tertiary)" }}
        >
          {t("projects.subtitle")}
        </motion.p>

        <div className="space-y-12">
          {projects.map((project, idx) => (
            <motion.a
              key={idx}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: idx * 0.1, ease }}
              className="block rounded-[1.5rem] overflow-hidden card-lift gradient-border group"
              style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
            >
              <div className="overflow-hidden relative h-[360px] md:h-56 sm:h-44">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 980px) 100vw, 980px"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
              </div>
              <div className="p-8 md:p-6">
                <h3 className="text-2xl font-bold mb-2 md:text-xl" style={{ color: "var(--text)" }}>{project.title}</h3>
                <p className="text-base mb-3 md:text-sm" style={{ color: "var(--text-tertiary)" }}>{project.description}</p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{project.tech}</p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
