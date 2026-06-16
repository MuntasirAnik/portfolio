import React, { useEffect, useRef } from "react";

export default function SiteUnavailable() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      t += 0.003;
      const w = canvas.width;
      const h = canvas.height;

      // Light animated gradient background
      const grad = ctx.createLinearGradient(
        w * 0.5 + Math.sin(t) * w * 0.3,
        0,
        w * 0.5 + Math.cos(t * 0.7) * w * 0.3,
        h
      );
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.3, "#f8f8fa");
      grad.addColorStop(0.6, "#f2f4f8");
      grad.addColorStop(1, "#f5f5f7");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Soft floating orbs
      const orbs = [
        { x: 0.3, y: 0.4, r: 300, color: "rgba(0, 113, 227, 0.045)", speed: 0.8 },
        { x: 0.7, y: 0.6, r: 340, color: "rgba(88, 86, 214, 0.035)", speed: 1.2 },
        { x: 0.5, y: 0.25, r: 220, color: "rgba(0, 113, 227, 0.03)", speed: 0.6 },
        { x: 0.2, y: 0.7, r: 260, color: "rgba(52, 199, 89, 0.025)", speed: 0.9 },
      ];

      for (const orb of orbs) {
        const ox = w * orb.x + Math.sin(t * orb.speed) * 90;
        const oy = h * orb.y + Math.cos(t * orb.speed * 0.8) * 70;
        const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, orb.r);
        g.addColorStop(0, orb.color);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(ox, oy, orb.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Subtle dot grid
      ctx.fillStyle = "rgba(0, 0, 0, 0.025)";
      const spacing = 40;
      for (let x = 0; x < w; x += spacing) {
        for (let y = 0; y < h; y += spacing) {
          ctx.beginPath();
          ctx.arc(x, y, 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          maxWidth: "560px",
          padding: "0 24px",
        }}
      >
        {/* Decorative line */}
        <div
          style={{
            width: "48px",
            height: "2px",
            background: "linear-gradient(90deg, transparent, rgba(0, 113, 227, 0.5), transparent)",
            margin: "0 auto 32px",
            animation: "unavail-pulse 3s ease-in-out infinite",
          }}
        />

        {/* Name */}
        <p
          style={{
            fontSize: "13px",
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#86868b",
            marginBottom: "24px",
          }}
        >
          Muntasir Anik
        </p>

        {/* Main heading */}
        <h1
          style={{
            fontSize: "clamp(32px, 6vw, 56px)",
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: "#1d1d1f",
            margin: "0 0 20px",
          }}
        >
          Coming Soon
        </h1>

        {/* Subtext */}
        <p
          style={{
            fontSize: "clamp(16px, 2.5vw, 20px)",
            lineHeight: 1.6,
            color: "#6e6e73",
            margin: "0 0 40px",
            fontWeight: 400,
          }}
        >
          This portfolio is currently being updated.
          <br />
          Check back shortly for something new.
        </p>

        {/* Animated status indicator */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 20px",
            borderRadius: "980px",
            background: "rgba(255, 255, 255, 0.7)",
            border: "1px solid rgba(0, 0, 0, 0.06)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#ff9f0a",
              animation: "unavail-blink 2s ease-in-out infinite",
              boxShadow: "0 0 8px rgba(255, 159, 10, 0.3)",
            }}
          />
          <span
            style={{
              fontSize: "13px",
              fontWeight: 500,
              color: "#86868b",
              letterSpacing: "0.02em",
            }}
          >
            Under Maintenance
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes unavail-pulse {
          0%, 100% { opacity: 0.4; width: 48px; }
          50% { opacity: 1; width: 72px; }
        }
        @keyframes unavail-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
