import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
  leaving: boolean;
}

interface ToastContextValue {
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
  };
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Return a no-op toast for non-wrapped components
    return {
      toast: {
        success: () => {},
        error: () => {},
        info: () => {},
        warning: () => {},
      },
    };
  }
  return ctx;
}

let toastCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const removeToast = useCallback((id: string) => {
    // Start leave animation
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    // Remove after animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, duration = 4000) => {
      const id = `toast-${++toastCounter}`;
      setToasts((prev) => [...prev, { id, type, message, duration, leaving: false }]);

      if (duration > 0) {
        const timer = setTimeout(() => removeToast(id), duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [removeToast]
  );

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  const toast = {
    success: (message: string, duration?: number) => addToast("success", message, duration),
    error: (message: string, duration?: number) => addToast("error", message, duration ?? 5000),
    info: (message: string, duration?: number) => addToast("info", message, duration),
    warning: (message: string, duration?: number) => addToast("warning", message, duration ?? 5000),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

/* ============ Toast Container & Individual Toast ============ */

const ICONS: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  info: "ℹ",
  warning: "⚠",
};

const COLORS: Record<ToastType, { bg: string; border: string; icon: string; iconBg: string; text: string }> = {
  success: {
    bg: "rgba(255, 255, 255, 0.95)",
    border: "rgba(52, 199, 89, 0.25)",
    icon: "#fff",
    iconBg: "#34c759",
    text: "#1d1d1f",
  },
  error: {
    bg: "rgba(255, 255, 255, 0.95)",
    border: "rgba(255, 69, 58, 0.25)",
    icon: "#fff",
    iconBg: "#ff453a",
    text: "#1d1d1f",
  },
  info: {
    bg: "rgba(255, 255, 255, 0.95)",
    border: "rgba(0, 113, 227, 0.2)",
    icon: "#fff",
    iconBg: "#0071e3",
    text: "#1d1d1f",
  },
  warning: {
    bg: "rgba(255, 255, 255, 0.95)",
    border: "rgba(255, 159, 10, 0.3)",
    icon: "#fff",
    iconBg: "#ff9f0a",
    text: "#1d1d1f",
  },
};

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 99999,
        display: "flex",
        flexDirection: "column-reverse",
        gap: "10px",
        maxWidth: "420px",
        width: "100%",
        pointerEvents: "none",
      }}
    >
      {toasts.map((t, i) => (
        <ToastItem key={t.id} toast={t} index={i} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, index, onDismiss }: { toast: Toast; index: number; onDismiss: (id: string) => void }) {
  const colors = COLORS[toast.type];
  const icon = ICONS[toast.type];
  const [progress, setProgress] = useState(100);
  const startRef = useRef(Date.now());

  useEffect(() => {
    if (toast.duration <= 0) return;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const remaining = Math.max(0, 100 - (elapsed / toast.duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [toast.duration]);

  return (
    <div
      style={{
        pointerEvents: "auto",
        background: colors.bg,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${colors.border}`,
        borderRadius: "16px",
        padding: "14px 16px",
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
        cursor: "pointer",
        overflow: "hidden",
        position: "relative",
        animation: toast.leaving
          ? "toast-out 0.3s ease forwards"
          : "toast-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        animationDelay: toast.leaving ? "0s" : `${index * 0.05}s`,
        transform: toast.leaving ? undefined : "translateX(120%)",
        opacity: toast.leaving ? undefined : 0,
      }}
      onClick={() => onDismiss(toast.id)}
      role="alert"
    >
      {/* Icon */}
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "9px",
          background: colors.iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: "14px",
          fontWeight: 700,
          color: colors.icon,
          boxShadow: `0 2px 8px ${colors.iconBg}40`,
        }}
      >
        {icon}
      </div>

      {/* Message */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: "14px",
            fontWeight: 500,
            color: colors.text,
            lineHeight: 1.45,
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          {toast.message}
        </p>
      </div>

      {/* Dismiss */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(toast.id);
        }}
        style={{
          background: "none",
          border: "none",
          color: "#86868b",
          fontSize: "16px",
          cursor: "pointer",
          padding: "2px",
          lineHeight: 1,
          flexShrink: 0,
          opacity: 0.5,
          transition: "opacity 0.15s",
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLElement).style.opacity = "1";
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLElement).style.opacity = "0.5";
        }}
      >
        ✕
      </button>

      {/* Progress bar */}
      {toast.duration > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: "rgba(0, 0, 0, 0.04)",
            borderRadius: "0 0 16px 16px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: colors.iconBg,
              opacity: 0.5,
              borderRadius: "0 0 16px 16px",
              transition: "width 0.1s linear",
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes toast-in {
          from {
            transform: translateX(120%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes toast-out {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(120%);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
