import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ease = [0.22, 1, 0.36, 1];

const name = "Muntasir Anik";

const Preloader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [phase, setPhase] = useState<"loading" | "exiting" | "revealing" | "done">("loading");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("exiting"), 800);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (phase === "exiting") {
      const t2 = setTimeout(() => setPhase("revealing"), 300);
      return () => clearTimeout(t2);
    }
    if (phase === "revealing") {
      const t3 = setTimeout(() => setPhase("done"), 400);
      return () => clearTimeout(t3);
    }
  }, [phase]);

  return (
    <>
      <AnimatePresence>
        {phase === "loading" && (
          <motion.div
            key="preloader"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 100000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "var(--bg, #ffffff)",
            }}
          >
            {/* Soft radial glow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease }}
              style={{
                position: "absolute",
                width: 400,
                height: 400,
                borderRadius: "50%",
                background: "radial-gradient(circle, var(--glow, rgba(0,113,227,0.1)) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 20,
                position: "relative",
                zIndex: 1,
              }}
            >
              {/* Typewriter name */}
              <div style={{ display: "flex", overflow: "hidden" }}>
                {name.split("").map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.3 + i * 0.06,
                      ease,
                    }}
                    style={{
                      fontSize: 44,
                      fontWeight: 700,
                      color: "var(--text, #1d1d1f)",
                      letterSpacing: "-0.02em",
                      lineHeight: 1,
                      display: "inline-block",
                      whiteSpace: "pre",
                    }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}

                {/* Blinking cursor */}
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{
                    duration: 0.8,
                    delay: 0.3 + name.length * 0.06,
                    repeat: Infinity,
                  }}
                  style={{
                    fontSize: 44,
                    fontWeight: 300,
                    color: "var(--blue, #0070f3)",
                    lineHeight: 1,
                    marginLeft: 2,
                  }}
                >
                  |
                </motion.span>
              </div>

              {/* Subtitle */}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.4, ease }}
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: "var(--text-secondary, #888)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Software Engineer
              </motion.span>

              {/* Loading bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                style={{
                  width: 80,
                  height: 2,
                  backgroundColor: "var(--border, rgba(0,0,0,0.05))",
                  borderRadius: 1,
                  overflow: "hidden",
                  marginTop: 4,
                }}
              >
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1, delay: 1.3, ease: [0.4, 0, 0.2, 1] }}
                  style={{
                    height: "100%",
                    background: "linear-gradient(90deg, var(--blue, #0070f3), #7928ca)",
                    borderRadius: 1,
                  }}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content — cinematic reveal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={
          phase === "revealing" || phase === "done"
            ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
            : { opacity: 0, y: 30, scale: 0.98, filter: "blur(4px)" }
        }
        transition={{
          duration: 1,
          ease,
          opacity: { duration: 0.6 },
          y: { duration: 1 },
          scale: { duration: 1.2 },
          filter: { duration: 0.8 },
        }}
      >
        {children}
      </motion.div>
    </>
  );
};

export default Preloader;
