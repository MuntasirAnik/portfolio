import React, { useState, useEffect } from "react";
import useScrollSpy from "./hooks/useScrollSpy";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";

const SECTIONS = ["hero", "about", "experience", "projects", "github", "contact"];

const Navbar: React.FC = () => {
  const activeSection = useScrollSpy(SECTIONS, 80);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang, t } = useLanguage();

  const NAV_ITEMS = [
    { id: "about", label: t("nav.about") },
    { id: "experience", label: t("nav.experience") },
    { id: "projects", label: t("nav.projects") },
    { id: "contact", label: t("nav.contact") },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22,1,0.36,1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "backdrop-blur-xl border-b"
            : "bg-transparent"
        }`}
        style={{
          backgroundColor: scrolled ? "var(--nav-bg)" : "transparent",
          borderColor: scrolled ? "var(--border)" : "transparent",
          boxShadow: scrolled ? "0 1px 8px rgba(0,0,0,0.06)" : "none",
        }}
      >
        <div className="max-w-[980px] mx-auto px-6 h-12 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => scrollTo("hero")}
            className="flex flex-col items-center transition-transform hover:scale-105 active:scale-95"
            style={{ gap: 3 }}
          >
            <span
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "var(--text)",
                letterSpacing: "-0.04em",
                lineHeight: 1,
              }}
            >
              M
            </span>
            <span
              style={{
                display: "block",
                width: 14,
                height: 2,
                borderRadius: 1,
                backgroundColor: "var(--blue, #0071e3)",
              }}
            />
          </button>

          {/* Desktop Links */}
          <div className="flex items-center gap-7 md:hidden">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`nav-link text-xs transition-colors${activeSection === item.id ? ' active' : ''}`}
                style={{
                  color: activeSection === item.id ? "var(--text)" : "var(--text-tertiary)",
                  fontWeight: activeSection === item.id ? 500 : 400,
                }}
              >
                {item.label}
              </button>
            ))}

            {/* Divider */}
            <span className="w-px h-3" style={{ background: "var(--border)" }} />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="transition-colors p-0.5"
              style={{ color: "var(--text-tertiary)" }}
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile: toggles + menu */}
          <div className="hidden md:flex items-center gap-3">

            <button onClick={toggleTheme} className="p-0.5" style={{ color: "var(--text-tertiary)" }}>
              {theme === "light" ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              )}
            </button>
            <button className="p-1" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ color: "var(--text)" }}>
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 top-12 z-40 backdrop-blur-xl"
            style={{ backgroundColor: theme === "dark" ? "rgba(0,0,0,0.95)" : "rgba(255,255,255,0.95)" }}
          >
            <div className="flex flex-col items-center pt-16 gap-8">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="text-2xl font-semibold tracking-tight"
                  style={{ color: "var(--text)" }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
