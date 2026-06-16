import React, { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

const CustomCursor: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [hovering, setHovering] = useState(false);

  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  useEffect(() => {
    // Don't show on touch devices
    const isTouch = window.matchMedia("(hover: none)").matches;
    if (isTouch) return;

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const down = () => setClicked(true);
    const up = () => setClicked(false);

    const handleHover = () => {
      const checkHover = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const isInteractive =
          target.tagName === "A" ||
          target.tagName === "BUTTON" ||
          target.closest("a") !== null ||
          target.closest("button") !== null ||
          target.classList.contains("link-blue");
        setHovering(isInteractive);
      };
      document.addEventListener("mouseover", checkHover);
      return () => document.removeEventListener("mouseover", checkHover);
    };

    document.addEventListener("mousemove", move);
    document.addEventListener("mousedown", down);
    document.addEventListener("mouseup", up);
    const cleanupHover = handleHover();

    return () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mousedown", down);
      document.removeEventListener("mouseup", up);
      cleanupHover();
    };
  }, [x, y, visible]);

  if (!visible) return null;

  return (
    <>
      {/* Outer ring */}
      <motion.div
        style={{
          x,
          y,
          position: "fixed",
          top: -20,
          left: -20,
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "1.5px solid var(--blue)",
          pointerEvents: "none",
          zIndex: 99999,
          opacity: 0.5,
          scale: hovering ? 1.6 : clicked ? 0.8 : 1,
          transition: "scale 0.15s ease",
        }}
      />
      {/* Inner dot */}
      <motion.div
        style={{
          x,
          y,
          position: "fixed",
          top: -4,
          left: -4,
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "var(--blue)",
          pointerEvents: "none",
          zIndex: 99999,
          opacity: 0.8,
          scale: hovering ? 0 : clicked ? 0.5 : 1,
          transition: "scale 0.15s ease, opacity 0.15s ease",
        }}
      />
    </>
  );
};

export default CustomCursor;
