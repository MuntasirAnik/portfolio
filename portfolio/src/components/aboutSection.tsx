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

const AboutSection: React.FC<{ content: SiteContent }> = ({ content }) => {
  const { about, profileImages } = content;
  const { t } = useLanguage();

  return (
    <section id="about" className="section-gray py-10 md:py-8">
      <div className="max-w-[980px] mx-auto px-6">
        <motion.h2
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          custom={0} variants={fadeUp}
          className="section-accent text-[40px] font-bold tracking-[-0.02em] text-center mb-4 md:text-3xl sm:text-2xl"
          style={{ color: "var(--text)" }}
        >
          {t("about.title")}
        </motion.h2>
        <motion.p
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          custom={1} variants={fadeUp}
          className="text-xl text-center mb-6 md:text-lg sm:text-base"
          style={{ color: "var(--text-tertiary)" }}
        >
          {t("about.subtitle")}
        </motion.p>

        <div className="grid grid-cols-2 gap-12 items-center lg:grid-cols-1 lg:gap-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease }}
            className="flex justify-center lg:order-1"
          >
            <div className="profile-glow img-zoom relative w-[320px] h-[380px] rounded-[2rem] overflow-hidden lg:w-72 lg:h-[340px] md:w-60 md:h-72">
              <Image
                src={profileImages.about}
                alt="About"
                fill
                sizes="(max-width: 768px) 240px, (max-width: 1024px) 288px, 320px"
                className="object-cover"
              />
            </div>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="lg:order-2 lg:text-center"
          >
            {about.bio.map((para, i) => (
              <motion.p
                key={i} custom={i} variants={fadeUp}
                className="text-lg leading-relaxed mb-4 md:text-base"
                style={{ color: i === 0 ? "var(--text)" : "var(--text-tertiary)" }}
              >
                {para}
              </motion.p>
            ))}

            <motion.div custom={about.bio.length} variants={fadeUp} className="flex gap-12 lg:justify-center md:gap-8 mt-3">
              {about.stats.map((stat) => (
                <div key={stat.label} className="lg:text-center">
                  <div className="stat-value text-[48px] font-bold tracking-tight md:text-4xl">{stat.value}</div>
                  <div className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
