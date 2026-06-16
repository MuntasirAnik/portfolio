import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SiteContent } from "@/lib/content";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/components/toast";

const ease = [0.25, 0.1, 0.25, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease },
  }),
};

const ContactSection: React.FC<{ content: SiteContent }> = ({ content }) => {
  const { contact, social } = content;
  const { t } = useLanguage();
  const { toast } = useToast();

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus("sent");
        setForm({ name: "", email: "", message: "" });
        toast.success("Message sent successfully!");
        setTimeout(() => setStatus("idle"), 4000);
      } else {
        setStatus("error");
        toast.error("Failed to send message. Please try again.");
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch {
      setStatus("error");
      toast.error("Failed to send message. Please try again.");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <section id="contact" className="section-gray py-10 md:py-8">
      <div className="max-w-[680px] mx-auto px-6">
        <motion.h2
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          custom={0} variants={fadeUp}
          className="section-accent text-[40px] font-bold tracking-[-0.02em] text-center mb-4 md:text-3xl sm:text-2xl"
          style={{ color: "var(--text)" }}
        >
          {contact.headline}
        </motion.h2>
        <motion.p
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          custom={1} variants={fadeUp}
          className="text-xl text-center mb-8 md:text-lg sm:text-base"
          style={{ color: "var(--text-tertiary)" }}
        >
          {contact.description}
        </motion.p>

        {/* Contact Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.2, ease }}
          className="rounded-2xl p-8 md:p-6"
          style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
        >
          <div className="grid grid-cols-2 gap-4 mb-4 sm:grid-cols-1">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                maxLength={200}
                className="glass-input w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                style={{
                  backgroundColor: "var(--bg-alt)",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                  "--tw-ring-color": "var(--blue)",
                } as any}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                maxLength={200}
                className="glass-input w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                style={{
                  backgroundColor: "var(--bg-alt)",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                  "--tw-ring-color": "var(--blue)",
                } as any}
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Message
            </label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
              maxLength={5000}
              rows={5}
              className="glass-input w-full px-4 py-3 rounded-xl text-sm resize-y focus:outline-none"
              style={{
                backgroundColor: "var(--bg-alt)",
                color: "var(--text)",
                border: "1px solid var(--border)",
                "--tw-ring-color": "var(--blue)",
              } as any}
              placeholder="What would you like to say?"
            />
          </div>

          <div className="flex items-center justify-between sm:flex-col sm:gap-3">
            <button
              type="submit"
              disabled={status === "sending"}
              className="btn-apple btn-gradient disabled:opacity-50"
            >
              {status === "sending" ? "Sending..." : t("contact.sayHello")}
            </button>

            <AnimatePresence>
              {status === "sent" && (
                <motion.span
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-sm font-medium text-green-600"
                >
                  ✓ Message sent successfully!
                </motion.span>
              )}
              {status === "error" && (
                <motion.span
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-sm font-medium text-red-500"
                >
                  Failed to send. Please try again.
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </motion.form>

        {/* Social Icons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.4, ease }}
          className="flex items-center justify-center gap-4 mt-8"
        >
          {social.linkedin && (
            <motion.a
              href={social.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn"
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="contact-link-pill"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span>LinkedIn</span>
            </motion.a>
          )}
          {social.github && (
            <motion.a
              href={social.github} target="_blank" rel="noopener noreferrer" title="GitHub"
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="contact-link-pill"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span>GitHub</span>
            </motion.a>
          )}
          {social.email && (
            <motion.a
              href={`mailto:${social.email}`} title="Email"
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="contact-link-pill"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 7l-10 7L2 7" />
              </svg>
              <span>Email</span>
            </motion.a>
          )}
          {(social.extra || []).filter(l => l.label && l.url).map((link, i) => (
            <motion.a
              key={i} href={link.url} target="_blank" rel="noopener noreferrer" title={link.label}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="contact-link-pill"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              <span>{link.label}</span>
            </motion.a>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default ContactSection;
