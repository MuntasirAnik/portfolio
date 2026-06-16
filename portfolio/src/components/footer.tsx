import React, { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/views")
      .then((r) => r.json())
      .then((d) => setViews(d.total))
      .catch(() => {});
  }, []);

  return (
    <footer
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        background: "color-mix(in srgb, var(--bg, #fff) 72%, transparent)",
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
        borderTop: "1px solid var(--border, rgba(0,0,0,0.08))",
      }}
    >
      <div className="max-w-[980px] mx-auto px-6 flex items-center justify-between" style={{ height: "36px" }}>
        <p className="text-[11px] tracking-wide" style={{ color: "var(--text-tertiary, #86868b)" }}>
          © {new Date().getFullYear()} Muntasir Anik
        </p>

        <div className="flex items-center gap-4">
          {views !== null && (
            <span
              className="text-[11px] tabular-nums flex items-center gap-1.5"
              style={{ color: "var(--text-tertiary, #86868b)" }}
            >
              <span style={{ display: "inline-block", width: 4, height: 4, borderRadius: "50%", background: "#34c759" }} />
              {views.toLocaleString()}
            </span>
          )}
          <span className="text-[11px]" style={{ color: "var(--text-tertiary, #86868b)" }}>
            {t("footer.rights")}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
