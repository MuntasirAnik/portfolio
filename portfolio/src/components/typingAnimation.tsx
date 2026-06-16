import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface TypingAnimationProps {
  roles: string[];
  className?: string;
  style?: React.CSSProperties;
}

const TYPING_SPEED = 80;
const DELETING_SPEED = 40;
const PAUSE_AFTER_TYPE = 2000;
const PAUSE_AFTER_DELETE = 400;

const TypingAnimation: React.FC<TypingAnimationProps> = ({ roles, className, style }) => {
  const [text, setText] = useState("");
  const roleIndexRef = useRef(0);
  const isDeletingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const tick = () => {
      const currentRole = roles[roleIndexRef.current] || "";
      const isDeleting = isDeletingRef.current;

      if (!isDeleting) {
        // Typing
        setText((prev) => {
          const next = currentRole.slice(0, prev.length + 1);
          if (next.length >= currentRole.length) {
            // Done typing — pause then start deleting
            isDeletingRef.current = true;
            timerRef.current = setTimeout(tick, PAUSE_AFTER_TYPE);
          } else {
            timerRef.current = setTimeout(tick, TYPING_SPEED + Math.random() * 40);
          }
          return next;
        });
      } else {
        // Deleting
        setText((prev) => {
          if (prev.length > 0) {
            timerRef.current = setTimeout(tick, DELETING_SPEED);
            return prev.slice(0, -1);
          } else {
            // Done deleting — move to next role
            isDeletingRef.current = false;
            roleIndexRef.current = (roleIndexRef.current + 1) % roles.length;
            timerRef.current = setTimeout(tick, PAUSE_AFTER_DELETE);
            return "";
          }
        });
      }
    };

    timerRef.current = setTimeout(tick, PAUSE_AFTER_DELETE);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [roles]);

  return (
    <span className={className} style={style}>
      {text}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
        style={{ color: "var(--blue)" }}
      >
        |
      </motion.span>
    </span>
  );
};

export default TypingAnimation;
