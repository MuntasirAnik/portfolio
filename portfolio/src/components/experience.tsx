import React from "react";
import { motion, useInView } from "framer-motion";
import type { SiteContent } from "@/lib/content";
import { useLanguage } from "@/hooks/useLanguage";

const ease = [0.25, 0.1, 0.25, 1];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease },
  }),
};

function calcDuration(timeStr: string): string {
  if (!timeStr) return "";
  const months: Record<string, number> = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
  const parts = timeStr.split("—").map(s => s.trim());
  if (parts.length < 2) return "";

  const parseDate = (s: string): Date | null => {
    if (s.toLowerCase() === "present") return new Date();
    const m = s.match(/^([A-Za-z]+)\s+(\d{4})$/);
    if (m) return new Date(parseInt(m[2]), months[m[1]] ?? 0);
    const y = s.match(/^(\d{4})$/);
    if (y) return new Date(parseInt(y[1]), 0);
    return null;
  };

  const start = parseDate(parts[0]);
  const end = parseDate(parts[1]);
  if (!start || !end) return "";

  let totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (totalMonths < 0) totalMonths = 0;
  const yrs = Math.floor(totalMonths / 12);
  const mos = totalMonths % 12;

  if (yrs === 0 && mos === 0) return "< 1 mo";
  const yPart = yrs > 0 ? `${yrs} yr${yrs > 1 ? "s" : ""}` : "";
  const mPart = mos > 0 ? `${mos} mo${mos > 1 ? "s" : ""}` : "";
  return [yPart, mPart].filter(Boolean).join(" ");
}

const SkillBar: React.FC<{ name: string; level: number; delay: number }> = ({ name, level, delay }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div ref={ref} className="mb-4">
      <div className="flex justify-between mb-1.5">
        <span className="text-sm font-medium" style={{ color: "var(--text)" }}>{name}</span>
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{level}%</span>
      </div>
      <div className="skill-bar-track">
        <motion.div
          className="skill-bar-fill"
          initial={{ width: 0 }}
          animate={isInView ? { width: `${level}%` } : { width: 0 }}
          transition={{ duration: 1.2, delay: delay * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
        />
      </div>
    </div>
  );
};

const Experience: React.FC<{ content: SiteContent }> = ({ content }) => {
  const { experience, education, skills } = content;
  const { t } = useLanguage();

  return (
    <section id="experience" className="section-white py-10 md:py-8">
      <div className="max-w-[980px] mx-auto px-6">
        <motion.h2
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          custom={0} variants={fadeUp}
          className="section-accent text-[40px] font-bold tracking-[-0.02em] text-center mb-4 md:text-3xl sm:text-2xl"
          style={{ color: "var(--text)" }}
        >
          {t("exp.title")}
        </motion.h2>
        <motion.p
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          custom={1} variants={fadeUp}
          className="text-xl text-center mb-8 md:text-lg sm:text-base"
          style={{ color: "var(--text-tertiary)" }}
        >
          {t("exp.subtitle")}
        </motion.p>

        {/* Work */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={container} className="mb-12">
          <motion.h3 variants={item} className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--text-secondary)" }}>
            {t("exp.work")}
          </motion.h3>
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {experience.map((exp, idx) => (
              <motion.div key={idx} variants={item} className="py-6 flex items-start justify-between gap-4 md:flex-col md:gap-1">
                <div>
                  <h4 className="text-lg font-semibold md:text-base" style={{ color: "var(--text)" }}>{exp.position}</h4>
                  <a href={exp.companyLink} target="_blank" rel="noopener noreferrer" className="link-blue text-base md:text-sm">{exp.company}</a>
                </div>
                <div className="text-right md:text-left">
                  <span className="text-sm whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>{exp.time}</span>
                  {calcDuration(exp.time) && (
                    <span className="block text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{calcDuration(exp.time)}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Education */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={container} className="mb-12">
          <motion.h3 variants={item} className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--text-secondary)" }}>
            {t("exp.education")}
          </motion.h3>
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {education.map((edu, idx) => (
              <motion.div key={idx} variants={item} className="py-6 flex items-start justify-between gap-4 md:flex-col md:gap-1">
                <div>
                  <h4 className="text-lg font-semibold md:text-base" style={{ color: "var(--text)" }}>{edu.degree}</h4>
                  <p className="text-base md:text-sm" style={{ color: "var(--text-tertiary)" }}>{edu.place}</p>
                </div>
                <span className="text-sm whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>{edu.time}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Skills — Animated Bars */}
        <motion.div
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={container}
        >
          <motion.h3 variants={item} className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--text-secondary)" }}>
            {t("exp.technologies")}
          </motion.h3>
          <div className="grid grid-cols-2 gap-x-12 gap-y-1 lg:grid-cols-1">
            {skills.map((skill, idx) => (
              <SkillBar key={skill.name} name={skill.name} level={skill.level} delay={idx} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Experience;
