import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Inter } from "next/font/google";
import type { SiteContent } from "@/lib/content";
import type { Message } from "@/pages/api/contact";
import type { ParsedCV } from "@/lib/cvParser";
import { useToast } from "@/components/toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

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
  const yP = yrs > 0 ? `${yrs} yr${yrs > 1 ? "s" : ""}` : "";
  const mP = mos > 0 ? `${mos} mo${mos > 1 ? "s" : ""}` : "";
  return [yP, mP].filter(Boolean).join(" ");
}

const SECTIONS = [
  { key: "hero", label: "Hero" },
  { key: "about", label: "About" },
  { key: "experience", label: "Experience" },
  { key: "education", label: "Education" },
  { key: "skills", label: "Skills" },
  { key: "projects", label: "Projects" },
  { key: "publication", label: "Publication" },
  { key: "contact", label: "Contact" },
  { key: "social", label: "Social Links" },
  { key: "github", label: "GitHub" },
  { key: "messages", label: "Messages" },
  { key: "import-cv", label: "📄 Import CV" },
  { key: "site-settings", label: "⚙️ Site Settings" },
] as const;

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [content, setContent] = useState<SiteContent | null>(null);
  const [activeSection, setActiveSection] = useState("hero");
  const [saving, setSaving] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [views, setViews] = useState<{ total: number; today: number } | null>(null);
  const [siteEnabled, setSiteEnabled] = useState(true);
  const [customCursor, setCustomCursor] = useState(true);
  const [togglingsite, setTogglingSite] = useState(false);
  const [cvInfo, setCvInfo] = useState<{ exists: boolean; filename: string; size: number; lastModified: string } | null>(null);
  const [cvUploading, setCvUploading] = useState(false);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const reorderItems = (items: any[], from: number, to: number) => {
    const copy = [...items];
    const [moved] = copy.splice(from, 1);
    copy.splice(to, 0, moved);
    return copy;
  };

  useEffect(() => {
    fetchContent();
    fetchMessages();
    fetchViews();
    fetchSiteStatus();
    fetchCvInfo();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await fetch("/api/admin/content");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.social && !Array.isArray(data.social.extra)) {
        data.social.extra = [];
      }
      setContent(data);
    } catch {
      toast.error("Failed to load content");
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/admin/messages");
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch {
      // messages tab just won't show data
    }
  };

  const fetchViews = async () => {
    try {
      const res = await fetch("/api/views");
      if (res.ok) {
        const data = await res.json();
        setViews(data);
      }
    } catch {}
  };

  const fetchSiteStatus = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setSiteEnabled(data.siteEnabled !== false);
        setCustomCursor(data.customCursor !== false);
      }
    } catch {}
  };

  const toggleCursor = async () => {
    const newVal = !customCursor;
    setCustomCursor(newVal);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customCursor: newVal }),
      });
      if (res.ok) {
        toast.success(newVal ? "Custom cursor enabled" : "Default cursor enabled");
      } else {
        const err = await res.json().catch(() => null);
        setCustomCursor(!newVal);
        toast.error(err?.error || `Failed to update cursor (${res.status})`);
      }
    } catch {
      setCustomCursor(!newVal);
      toast.error("Failed to update cursor setting");
    }
  };

  const fetchCvInfo = async () => {
    try {
      const res = await fetch("/api/admin/cv");
      if (res.ok) {
        const data = await res.json();
        setCvInfo(data);
      }
    } catch {}
  };

  const handleCvUpload = async (file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are accepted");
      return;
    }
    setCvUploading(true);
    const formData = new FormData();
    formData.append("cv", file);
    try {
      const res = await fetch("/api/admin/cv", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setCvInfo({ exists: true, filename: data.filename, size: data.size, lastModified: data.lastModified });
        toast.success("CV uploaded successfully");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to upload CV");
      }
    } catch {
      toast.error("Failed to upload CV");
    } finally {
      setCvUploading(false);
      if (cvInputRef.current) cvInputRef.current.value = "";
    }
  };

  const handleCvDelete = async () => {
    try {
      const res = await fetch("/api/admin/cv", { method: "DELETE" });
      if (res.ok) {
        setCvInfo({ exists: false, filename: "", size: 0, lastModified: "" });
        toast.success("CV deleted");
      } else {
        const err = await res.json().catch(() => null);
        toast.error(err?.error || `Failed to delete CV (${res.status})`);
      }
    } catch {
      toast.error("Failed to delete CV");
    }
  };

  const toggleSiteEnabled = async () => {
    setTogglingSite(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteEnabled: !siteEnabled }),
      });
      if (res.ok) {
        const newState = !siteEnabled;
        setSiteEnabled(newState);
        toast.success(newState ? "Site is now live" : "Site taken offline");
      } else {
        const err = await res.json().catch(() => null);
        toast.error(err?.error || `Failed to update site status (${res.status})`);
      }
    } catch {
      toast.error("Failed to update site status");
    } finally {
      setTogglingSite(false);
    }
  };

  const saveContent = async () => {
    if (!content) return;
    setSaving(true);

    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      if (res.ok) {
        // Trigger on-demand revalidation so changes appear immediately on Vercel
        try {
          await fetch("/api/revalidate", { method: "POST" });
        } catch {
          // Revalidation failure is non-critical — ISR will catch up eventually
        }
        toast.success("All changes saved successfully");
      } else {
        const err = await res.json().catch(() => null);
        toast.error(err?.error || `Failed to save (${res.status})`);
      }
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        return data.url;
      }
    } catch {}
    return null;
  };

  if (!content) {
    return (
      <div className={`${inter.variable} font-inter min-h-screen bg-[#f5f5f7] flex items-center justify-center`}>
        <p className="text-[#86868b]">Loading...</p>
      </div>
    );
  }

  const update = (path: string, value: any) => {
    setContent((prev) => {
      if (!prev) return prev;
      const copy = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let obj: any = copy;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return copy;
    });
  };

  return (
    <>
      <Head>
        <title>Admin — Dashboard</title>
      </Head>
      <div className={`${inter.variable} font-inter min-h-screen bg-[#f5f5f7]`}>
        {/* Top Bar */}
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/5">
          <div className="max-w-7xl mx-auto px-6 h-12 flex items-center justify-between">
            <span className="text-sm font-semibold text-[#1d1d1f]">Admin Panel</span>
            <div className="flex items-center gap-4">
              {views && (
                <span className="text-xs text-[#86868b] hidden sm:inline">
                  👁 {views.total} total · {views.today} today
                </span>
              )}

              <button
                onClick={saveContent}
                disabled={saving}
                className="bg-[#0071e3] text-white text-sm font-medium px-4 py-1.5 rounded-full hover:bg-[#0077ed] transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save All"}
              </button>
              <button
                onClick={handleLogout}
                className="text-[#86868b] hover:text-[#ff453a] transition p-1.5 rounded-lg hover:bg-red-50"
                title="Logout"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8 lg:flex-col">
          {/* Sidebar */}
          <nav className="w-48 flex-shrink-0 lg:w-full">
            <div className="sticky top-20 flex flex-col gap-1 lg:flex-row lg:flex-wrap lg:gap-2">
              {SECTIONS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setActiveSection(s.key)}
                  className={`text-left px-4 py-2 rounded-xl text-sm font-medium transition lg:text-center ${
                    activeSection === s.key
                      ? "bg-white text-[#1d1d1f] shadow-sm"
                      : "text-[#86868b] hover:text-[#1d1d1f]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl p-8 shadow-sm md:p-5">

              {/* HERO */}
              {activeSection === "hero" && (
                <div>
                  <h2 className="text-2xl font-bold text-[#1d1d1f] mb-6">Hero Section</h2>
                  <Field label="Name" value={content.hero.name} onChange={(v) => update("hero.name", v)} />
                  <Field label="Title" value={content.hero.title} onChange={(v) => update("hero.title", v)} />

                  <h3 className="text-xs font-semibold text-[#86868b] uppercase tracking-widest mb-3 mt-6">Animated Typing Roles</h3>
                  <p className="text-xs text-[#86868b] mb-3">These cycle in the hero typing animation.</p>
                  {(content.hero.roles || []).map((role, i) => (
                    <div key={i} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => {
                          const updated = [...content.hero.roles];
                          updated[i] = e.target.value;
                          setContent({ ...content, hero: { ...content.hero, roles: updated } });
                        }}
                        className="flex-1 px-3 py-2 rounded-lg text-sm border border-black/5 bg-white text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                      />
                      <button
                        onClick={() => {
                          const updated = content.hero.roles.filter((_, idx) => idx !== i);
                          setContent({ ...content, hero: { ...content.hero, roles: updated } });
                        }}
                        className="text-xs text-red-400 hover:text-red-600 transition px-2 py-1"
                      >✕</button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const updated = [...(content.hero.roles || []), ""];
                      setContent({ ...content, hero: { ...content.hero, roles: updated } });
                    }}
                    className="text-sm text-[#0071e3] font-medium mt-1 mb-4"
                  >+ Add role</button>

                  <TextArea label="Description" value={content.hero.description} onChange={(v) => update("hero.description", v)} />
                  <ImageField
                    label="Profile Image"
                    current={content.profileImages.hero}
                    onUpload={async (file) => {
                      const url = await uploadImage(file);
                      if (url) update("profileImages.hero", url);
                    }}
                  />

                  <h3 className="text-xs font-semibold text-[#86868b] uppercase tracking-widest mb-3 mt-8">Availability Status</h3>
                  <CustomSelect
                    value={content.availability?.status || "available"}
                    onChange={(v) => update("availability.status", v)}
                    options={[
                      { value: "available", label: "🟢 Available" },
                      { value: "unavailable", label: "🔴 Unavailable" },
                    ]}
                  />
                  <h3 className="text-xs font-semibold text-[#86868b] uppercase tracking-widest mb-3 mt-3">Status Text</h3>
                  <CustomSelect
                    value={content.availability?.text || "Open to Work"}
                    onChange={(v) => update("availability.text", v)}
                    options={[
                      { value: "Open to Work", label: "Open to Work" },
                      { value: "Available for Hire", label: "Available for Hire" },
                      { value: "Open to Opportunities", label: "Open to Opportunities" },
                      { value: "Freelancing", label: "Freelancing" },
                      { value: "Currently Employed", label: "Currently Employed" },
                      { value: "Not Available", label: "Not Available" },
                      { value: "On a Break", label: "On a Break" },
                    ]}
                  />
                </div>
              )}

              {/* ABOUT */}
              {activeSection === "about" && (
                <div>
                  <h2 className="text-2xl font-bold text-[#1d1d1f] mb-6">About Section</h2>
                  {content.about.bio.map((para, i) => (
                    <TextArea
                      key={i}
                      label={`Paragraph ${i + 1}`}
                      value={para}
                      onChange={(v) => {
                        const newBio = [...content.about.bio];
                        newBio[i] = v;
                        update("about.bio", newBio);
                      }}
                      onRemove={content.about.bio.length > 1 ? () => {
                        const newBio = content.about.bio.filter((_, idx) => idx !== i);
                        update("about.bio", newBio);
                      } : undefined}
                    />
                  ))}
                  <button
                    onClick={() => update("about.bio", [...content.about.bio, ""])}
                    className="text-sm text-[#0071e3] font-medium mt-2 mb-6"
                  >
                    + Add paragraph
                  </button>

                  <h3 className="text-xs font-semibold text-[#86868b] uppercase tracking-widest mb-4 mt-6">Stats</h3>
                  {content.about.stats.map((stat, i) => (
                    <div key={i} className="flex gap-4 mb-3">
                      <input
                        value={stat.value}
                        onChange={(e) => {
                          const newStats = [...content.about.stats];
                          newStats[i] = { ...newStats[i], value: e.target.value };
                          update("about.stats", newStats);
                        }}
                        className="flex-1 input-field"
                        placeholder="Value"
                      />
                      <input
                        value={stat.label}
                        onChange={(e) => {
                          const newStats = [...content.about.stats];
                          newStats[i] = { ...newStats[i], label: e.target.value };
                          update("about.stats", newStats);
                        }}
                        className="flex-1 input-field"
                        placeholder="Label"
                      />
                    </div>
                  ))}

                  <ImageField
                    label="About Photo"
                    current={content.profileImages.about}
                    onUpload={async (file) => {
                      const url = await uploadImage(file);
                      if (url) update("profileImages.about", url);
                    }}
                  />
                </div>
              )}

              {/* EXPERIENCE */}
              {activeSection === "experience" && (
                <div>
                  <h2 className="text-2xl font-bold text-[#1d1d1f] mb-2">Experience</h2>
                  <p className="text-xs text-[#86868b] mb-6">Drag the ⠿ handle to reorder</p>
                  {content.experience.map((exp, i) => (
                    <div
                      key={i}
                      draggable
                      onDragStart={() => setDragIndex(i)}
                      onDragOver={(e) => { e.preventDefault(); setDragOverIndex(i); }}
                      onDragLeave={() => setDragOverIndex(null)}
                      onDrop={() => {
                        if (dragIndex !== null && dragIndex !== i) {
                          update("experience", reorderItems(content.experience, dragIndex, i));
                        }
                        setDragIndex(null); setDragOverIndex(null);
                      }}
                      onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                      className={`border rounded-xl p-5 mb-3 transition-all ${
                        dragOverIndex === i && dragIndex !== i
                          ? 'border-[#0071e3] bg-blue-50/20 shadow-sm'
                          : dragIndex === i ? 'opacity-40 border-[#d2d2d7]' : 'border-[#d2d2d7]'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3">
                          <span className="cursor-grab active:cursor-grabbing text-[#c7c7cc] hover:text-[#86868b] text-lg select-none" title="Drag to reorder">⠿</span>
                          <span className="text-xs font-semibold text-[#86868b] uppercase tracking-widest">Entry {i + 1}</span>
                          {calcDuration(exp.time) && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{calcDuration(exp.time)}</span>}
                        </div>
                        <button onClick={() => {
                          const items = content.experience.filter((_, idx) => idx !== i);
                          update("experience", items);
                        }} className="text-xs text-red-500">Remove</button>
                      </div>
                      <Field label="Position" value={exp.position} onChange={(v) => {
                        const items = [...content.experience];
                        items[i] = { ...items[i], position: v };
                        update("experience", items);
                      }} />
                      <Field label="Company" value={exp.company} onChange={(v) => {
                        const items = [...content.experience];
                        items[i] = { ...items[i], company: v };
                        update("experience", items);
                      }} />
                      <Field label="Company Link" value={exp.companyLink} onChange={(v) => {
                        const items = [...content.experience];
                        items[i] = { ...items[i], companyLink: v };
                        update("experience", items);
                      }} />
                      {(() => {
                        // Parse existing time string like "Nov 2024 — Present" or "Feb 2022 — Oct 2024"
                        const parts = (exp.time || "").split("—").map(s => s.trim());
                        const isCurrent = parts[1]?.toLowerCase() === "present";

                        // Convert "Nov 2024" to "2024-11" for input[type=month]
                        const toMonthInput = (str: string) => {
                          if (!str || str.toLowerCase() === "present") return "";
                          const months: Record<string, string> = { Jan:"01",Feb:"02",Mar:"03",Apr:"04",May:"05",Jun:"06",Jul:"07",Aug:"08",Sep:"09",Oct:"10",Nov:"11",Dec:"12" };
                          const m = str.match(/^([A-Za-z]+)\s+(\d{4})$/);
                          if (m) return `${m[2]}-${months[m[1]] || "01"}`;
                          const y = str.match(/^(\d{4})$/);
                          if (y) return `${y[1]}-01`;
                          return "";
                        };

                        // Convert "2024-11" back to "Nov 2024"
                        const fromMonthInput = (val: string) => {
                          if (!val) return "";
                          const [y, m] = val.split("-");
                          const names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                          return `${names[parseInt(m, 10) - 1]} ${y}`;
                        };

                        const startVal = toMonthInput(parts[0] || "");
                        const endVal = toMonthInput(parts[1] || "");

                        const buildTime = (start: string, end: string, current: boolean) => {
                          const s = fromMonthInput(start);
                          if (!s) return "";
                          return current ? `${s} — Present` : end ? `${s} — ${fromMonthInput(end)}` : s;
                        };

                        return (
                          <div className="mb-4">
                            <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-widest mb-2">Time Period</label>
                            <div className="grid grid-cols-2 gap-3 mb-2">
                              <div>
                                <label className="block text-[10px] text-[#86868b] mb-1">Start</label>
                                <input
                                  type="month"
                                  value={startVal}
                                  onChange={(e) => {
                                    const items = [...content.experience];
                                    items[i] = { ...items[i], time: buildTime(e.target.value, endVal, isCurrent) };
                                    update("experience", items);
                                  }}
                                  className="w-full px-3 py-2 rounded-lg text-sm border border-black/5 bg-white text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                                />
                              </div>
                              {!isCurrent && (
                                <div>
                                  <label className="block text-[10px] text-[#86868b] mb-1">End</label>
                                  <input
                                    type="month"
                                    value={endVal}
                                    onChange={(e) => {
                                      const items = [...content.experience];
                                      items[i] = { ...items[i], time: buildTime(startVal, e.target.value, false) };
                                      update("experience", items);
                                    }}
                                    className="w-full px-3 py-2 rounded-lg text-sm border border-black/5 bg-white text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                                  />
                                </div>
                              )}
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isCurrent}
                                onChange={(e) => {
                                  const items = [...content.experience];
                                  items[i] = { ...items[i], time: buildTime(startVal, endVal, e.target.checked) };
                                  update("experience", items);
                                }}
                                className="rounded accent-[#0071e3]"
                              />
                              <span className="text-xs text-[#86868b]">Currently working here</span>
                            </label>
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                  <button
                    onClick={() => update("experience", [...content.experience, { position: "", company: "", companyLink: "", time: "" }])}
                    className="text-sm text-[#0071e3] font-medium"
                  >
                    + Add experience
                  </button>
                </div>
              )}

              {/* EDUCATION */}
              {activeSection === "education" && (
                <div>
                  <h2 className="text-2xl font-bold text-[#1d1d1f] mb-2">Education</h2>
                  <p className="text-xs text-[#86868b] mb-6">Drag the ⠿ handle to reorder</p>
                  {content.education.map((edu, i) => (
                    <div
                      key={i}
                      draggable
                      onDragStart={() => setDragIndex(i)}
                      onDragOver={(e) => { e.preventDefault(); setDragOverIndex(i); }}
                      onDragLeave={() => setDragOverIndex(null)}
                      onDrop={() => {
                        if (dragIndex !== null && dragIndex !== i) {
                          update("education", reorderItems(content.education, dragIndex, i));
                        }
                        setDragIndex(null); setDragOverIndex(null);
                      }}
                      onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                      className={`border rounded-xl p-5 mb-3 transition-all ${
                        dragOverIndex === i && dragIndex !== i
                          ? 'border-[#0071e3] bg-blue-50/20 shadow-sm'
                          : dragIndex === i ? 'opacity-40 border-[#d2d2d7]' : 'border-[#d2d2d7]'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3">
                          <span className="cursor-grab active:cursor-grabbing text-[#c7c7cc] hover:text-[#86868b] text-lg select-none" title="Drag to reorder">⠿</span>
                          <span className="text-xs font-semibold text-[#86868b] uppercase tracking-widest">Entry {i + 1}</span>
                        </div>
                        <button onClick={() => {
                          const items = content.education.filter((_, idx) => idx !== i);
                          update("education", items);
                        }} className="text-xs text-red-500">Remove</button>
                      </div>
                      <Field label="Degree" value={edu.degree} onChange={(v) => {
                        const items = [...content.education];
                        items[i] = { ...items[i], degree: v };
                        update("education", items);
                      }} />
                      <Field label="Institution" value={edu.place} onChange={(v) => {
                        const items = [...content.education];
                        items[i] = { ...items[i], place: v };
                        update("education", items);
                      }} />
                      <Field label="Time" value={edu.time} onChange={(v) => {
                        const items = [...content.education];
                        items[i] = { ...items[i], time: v };
                        update("education", items);
                      }} />
                    </div>
                  ))}
                  <button
                    onClick={() => update("education", [...content.education, { degree: "", place: "", time: "" }])}
                    className="text-sm text-[#0071e3] font-medium"
                  >
                    + Add education
                  </button>
                </div>
              )}

              {/* SKILLS */}
              {activeSection === "skills" && (
                <div>
                  <h2 className="text-2xl font-bold text-[#1d1d1f] mb-6">Skills & Proficiency</h2>

                  <div>
                    {content.skills.map((skill, i) => (
                      <div
                        key={i}
                        draggable
                        onDragStart={() => setDragIndex(i)}
                        onDragOver={(e) => { e.preventDefault(); setDragOverIndex(i); }}
                        onDragLeave={() => setDragOverIndex(null)}
                        onDrop={() => {
                          if (dragIndex !== null && dragIndex !== i) {
                            update("skills", reorderItems(content.skills, dragIndex, i));
                          }
                          setDragIndex(null); setDragOverIndex(null);
                        }}
                        onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                        className={`group flex items-center gap-3 py-2.5 px-2 rounded-lg transition-all ${
                          dragOverIndex === i && dragIndex !== i
                            ? 'bg-blue-50'
                            : dragIndex === i ? 'opacity-30' : 'hover:bg-[#f5f5f7]'
                        }`}
                      >
                        <span className="cursor-grab active:cursor-grabbing text-[#d2d2d7] group-hover:text-[#86868b] select-none text-sm leading-none">⠿</span>

                        <input
                          value={skill.name}
                          onChange={(e) => {
                            const items = [...content.skills];
                            items[i] = { ...items[i], name: e.target.value };
                            update("skills", items);
                          }}
                          className="w-32 bg-transparent text-sm font-medium text-[#1d1d1f] placeholder-[#c7c7cc] outline-none border-b border-transparent focus:border-[#0071e3] transition"
                          placeholder="Skill name"
                        />

                        <div className="flex-1 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-150"
                            style={{
                              width: `${skill.level}%`,
                              background: 'linear-gradient(90deg, #0071e3, #34aadc)',
                            }}
                          />
                        </div>

                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={skill.level}
                          onChange={(e) => {
                            const items = [...content.skills];
                            items[i] = { ...items[i], level: parseInt(e.target.value) };
                            update("skills", items);
                          }}
                          className="w-16 accent-[#0071e3]"
                        />

                        <span className="text-xs text-[#86868b] w-8 text-right tabular-nums">{skill.level}%</span>

                        <button
                          onClick={() => {
                            const items = content.skills.filter((_, idx) => idx !== i);
                            update("skills", items);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-[#c7c7cc] hover:text-red-500 transition text-sm leading-none"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => update("skills", [...content.skills, { name: "", level: 50 }])}
                    className="mt-3 text-sm text-[#0071e3] font-medium"
                  >
                    + Add skill
                  </button>
                </div>
              )}

              {/* PROJECTS */}
              {activeSection === "projects" && (
                <div>
                  <h2 className="text-2xl font-bold text-[#1d1d1f] mb-2">Projects</h2>
                  <p className="text-xs text-[#86868b] mb-6">Drag the ⠿ handle to reorder</p>
                  {content.projects.map((proj, i) => (
                    <div
                      key={i}
                      draggable
                      onDragStart={() => setDragIndex(i)}
                      onDragOver={(e) => { e.preventDefault(); setDragOverIndex(i); }}
                      onDragLeave={() => setDragOverIndex(null)}
                      onDrop={() => {
                        if (dragIndex !== null && dragIndex !== i) {
                          update("projects", reorderItems(content.projects, dragIndex, i));
                        }
                        setDragIndex(null); setDragOverIndex(null);
                      }}
                      onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                      className={`border rounded-xl p-5 mb-3 transition-all ${
                        dragOverIndex === i && dragIndex !== i
                          ? 'border-[#0071e3] bg-blue-50/20 shadow-sm'
                          : dragIndex === i ? 'opacity-40 border-[#d2d2d7]' : 'border-[#d2d2d7]'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3">
                          <span className="cursor-grab active:cursor-grabbing text-[#c7c7cc] hover:text-[#86868b] text-lg select-none" title="Drag to reorder">⠿</span>
                          <span className="text-xs font-semibold text-[#86868b] uppercase tracking-widest">{proj.title || `Project ${i + 1}`}</span>
                        </div>
                        <button onClick={() => {
                          const items = content.projects.filter((_, idx) => idx !== i);
                          update("projects", items);
                        }} className="text-xs text-red-500">Remove</button>
                      </div>
                      <Field label="Title" value={proj.title} onChange={(v) => {
                        const items = [...content.projects];
                        items[i] = { ...items[i], title: v };
                        update("projects", items);
                      }} />
                      <TextArea label="Description" value={proj.description} onChange={(v) => {
                        const items = [...content.projects];
                        items[i] = { ...items[i], description: v };
                        update("projects", items);
                      }} />
                      <Field label="Tech Stack" value={proj.tech} onChange={(v) => {
                        const items = [...content.projects];
                        items[i] = { ...items[i], tech: v };
                        update("projects", items);
                      }} />
                      <Field label="Link" value={proj.link} onChange={(v) => {
                        const items = [...content.projects];
                        items[i] = { ...items[i], link: v };
                        update("projects", items);
                      }} />
                      <ImageField
                        label="Project Image"
                        current={proj.image}
                        onUpload={async (file) => {
                          const url = await uploadImage(file);
                          if (url) {
                            const items = [...content.projects];
                            items[i] = { ...items[i], image: url };
                            update("projects", items);
                          }
                        }}
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => update("projects", [...content.projects, { title: "", description: "", tech: "", image: "", link: "" }])}
                    className="text-sm text-[#0071e3] font-medium"
                  >
                    + Add project
                  </button>
                </div>
              )}

              {/* PUBLICATION */}
              {activeSection === "publication" && (
                <div>
                  <h2 className="text-2xl font-bold text-[#1d1d1f] mb-6">Publication</h2>
                  <Field label="Title" value={content.publication.title} onChange={(v) => update("publication.title", v)} />
                  <Field label="Publisher" value={content.publication.publisher} onChange={(v) => update("publication.publisher", v)} />
                  <TextArea label="About" value={content.publication.about || ""} onChange={(v) => update("publication.about", v)} />
                  <Field label="Link" value={content.publication.link} onChange={(v) => update("publication.link", v)} />
                </div>
              )}

              {/* CONTACT */}
              {activeSection === "contact" && (
                <div>
                  <h2 className="text-2xl font-bold text-[#1d1d1f] mb-6">Contact</h2>
                  <Field label="Headline" value={content.contact.headline} onChange={(v) => update("contact.headline", v)} />
                  <TextArea label="Description" value={content.contact.description} onChange={(v) => update("contact.description", v)} />
                </div>
              )}

              {/* SOCIAL */}
              {activeSection === "social" && (() => {
                const allLinks = [
                  ...(content.social.linkedin ? [{ label: "LinkedIn", url: content.social.linkedin }] : []),
                  ...(content.social.github ? [{ label: "GitHub", url: content.social.github }] : []),
                  ...(content.social.email ? [{ label: "Email", url: content.social.email }] : []),
                  ...(content.social.extra || []),
                ];

                const updateAllLinks = (links: { label: string; url: string }[]) => {
                  const linkedin = links.find(l => l.label === "LinkedIn")?.url || "";
                  const github = links.find(l => l.label === "GitHub")?.url || "";
                  const email = links.find(l => l.label === "Email")?.url || "";
                  const extra = links.filter(l => l.label !== "LinkedIn" && l.label !== "GitHub" && l.label !== "Email");
                  setContent({ ...content, social: { linkedin, github, email, extra } });
                };

                return (
                  <div>
                    <h2 className="text-2xl font-bold text-[#1d1d1f] mb-6">Social Links</h2>

                    {allLinks.map((link, i) => (
                      <div key={i} className="flex items-center gap-3 mb-3">
                        <PlatformPicker
                          value={link.label}
                          onChange={(v) => {
                            const updated = [...allLinks];
                            updated[i] = { ...updated[i], label: v };
                            updateAllLinks(updated);
                          }}
                        />
                        <input
                          value={link.url}
                          onChange={(e) => {
                            const updated = [...allLinks];
                            updated[i] = { ...updated[i], url: e.target.value };
                            updateAllLinks(updated);
                          }}
                          className="input-field flex-1"
                          placeholder={link.label === "Email" ? "your@email.com" : "https://..."}
                        />
                        <button
                          onClick={() => {
                            const updated = allLinks.filter((_, idx) => idx !== i);
                            updateAllLinks(updated);
                          }}
                          className="text-[#c7c7cc] hover:text-red-500 transition text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={() => {
                        const updated = [...allLinks, { label: "", url: "" }];
                        updateAllLinks(updated);
                      }}
                      className="text-sm text-[#0071e3] font-medium mt-2"
                    >
                      + Add link
                    </button>
                  </div>
                );
              })()}

              {/* GITHUB */}
              {activeSection === "github" && (
                <div>
                  <h2 className="text-2xl font-bold text-[#1d1d1f] mb-6">GitHub Settings</h2>
                  <Field label="GitHub Username" value={content.github?.username || ""} onChange={(v) => update("github.username", v)} />
                  <p className="text-xs text-[#86868b] mt-1">The username used to fetch repos for the Open Source section.</p>
                </div>
              )}

              {/* MESSAGES */}
              {activeSection === "messages" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-[#1d1d1f]">Messages ({messages.length})</h2>
                    <span className="text-sm text-[#86868b]">{messages.filter(m => !m.read).length} unread</span>
                  </div>
                  {messages.length === 0 ? (
                    <p className="text-[#86868b] text-center py-12">No messages yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`border rounded-xl p-5 transition ${
                            msg.read ? "border-[#d2d2d7] bg-white" : "border-[#0071e3]/30 bg-blue-50/30"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                              <span className="text-base font-semibold text-[#1d1d1f]">{msg.name}</span>
                              <span className="text-xs text-[#86868b] ml-2">{msg.email}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-xs text-[#86868b]">
                                {new Date(msg.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </span>
                              {!msg.read && <span className="w-2 h-2 bg-[#0071e3] rounded-full" />}
                            </div>
                          </div>
                          <p className="text-sm text-[#1d1d1f] leading-relaxed whitespace-pre-wrap mb-3">{msg.message}</p>
                          <div className="flex gap-3">
                            <button
                              onClick={async () => {
                                await fetch("/api/admin/messages", {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ id: msg.id, read: !msg.read }),
                                });
                                fetchMessages();
                              }}
                              className="text-xs text-[#0071e3] font-medium"
                            >
                              {msg.read ? "Mark unread" : "Mark read"}
                            </button>
                            <button
                              onClick={async () => {
                                await fetch("/api/admin/messages", {
                                  method: "DELETE",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ id: msg.id }),
                                });
                                fetchMessages();
                                toast.success("Message deleted");
                              }}
                              className="text-xs text-red-500 font-medium"
                            >
                              Delete
                            </button>
                            <a
                              href={`mailto:${msg.email}`}
                              className="text-xs text-[#0071e3] font-medium"
                            >
                              Reply
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* IMPORT CV */}
              {activeSection === "import-cv" && (
                <CVImporter
                  onApply={(parsed) => {
                    if (!content) return;
                    const updated = { ...content };
                    if (parsed.name) updated.hero = { ...updated.hero, name: parsed.name };
                    if (parsed.title) updated.hero = { ...updated.hero, title: parsed.title };
                    if (parsed.bio) updated.about = { ...updated.about, bio: [parsed.bio] };
                    if (parsed.email) updated.social = { ...updated.social, email: parsed.email };
                    if (parsed.linkedin) updated.social = { ...updated.social, linkedin: parsed.linkedin };
                    if (parsed.github) updated.social = { ...updated.social, github: parsed.github };
                    if (parsed.experience.length) {
                      updated.experience = parsed.experience.map((e) => ({
                        position: e.position,
                        company: e.company,
                        companyLink: "",
                        time: e.time,
                        address: "",
                        work: e.position,
                      }));
                    }
                    if (parsed.education.length) {
                      updated.education = parsed.education.map((e) => ({
                        degree: e.degree,
                        place: e.place,
                        time: e.time,
                        info: e.degree,
                      }));
                    }
                    if (parsed.skills.length) {
                      updated.skills = parsed.skills.map((name, i) => ({
                        name,
                        level: 80 - i * 2,
                      }));
                    }
                    setContent(updated);
                    setActiveSection("hero");
                    toast.success("CV data imported! Review the sections and click Save All.");
                  }}
                />
              )}

              {/* SITE SETTINGS */}
              {activeSection === "site-settings" && (
                <div>
                  <h2 className="text-2xl font-bold text-[#1d1d1f] mb-6">Site Settings</h2>

                  {/* Site Availability */}
                  <div className="border border-[#d2d2d7] rounded-xl p-5 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-[#1d1d1f] mb-1">Site Availability</h3>
                        <p className="text-xs text-[#86868b]">
                          {siteEnabled
                            ? "Your portfolio is live and accessible to everyone."
                            : "Your portfolio is offline. Visitors see a \"Coming Soon\" page."}
                        </p>
                      </div>
                      <button
                        onClick={toggleSiteEnabled}
                        disabled={togglingsite}
                        className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none"
                        style={{
                          backgroundColor: siteEnabled ? '#34c759' : '#d2d2d7',
                          opacity: togglingsite ? 0.6 : 1,
                        }}
                      >
                        <span
                          className="inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200"
                          style={{ transform: siteEnabled ? 'translateX(22px)' : 'translateX(4px)' }}
                        />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        {siteEnabled && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        )}
                        <span
                          className="relative inline-flex rounded-full h-2 w-2"
                          style={{ backgroundColor: siteEnabled ? '#34c759' : '#ff453a' }}
                        />
                      </span>
                      <span className="text-xs font-medium" style={{ color: siteEnabled ? '#34c759' : '#ff453a' }}>
                        {siteEnabled ? 'Live' : 'Offline'}
                      </span>
                    </div>
                  </div>

                  {/* Custom Cursor */}
                  <div className="border border-[#d2d2d7] rounded-xl p-5 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-[#1d1d1f] mb-1">Custom Cursor</h3>
                        <p className="text-xs text-[#86868b]">
                          {customCursor
                            ? "Showing animated custom cursor with hover effects."
                            : "Using the browser's default cursor."}
                        </p>
                      </div>
                      <button
                        onClick={toggleCursor}
                        className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none"
                        style={{
                          backgroundColor: customCursor ? '#0071e3' : '#d2d2d7',
                        }}
                      >
                        <span
                          className="inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200"
                          style={{ transform: customCursor ? 'translateX(22px)' : 'translateX(4px)' }}
                        />
                      </button>
                    </div>
                  </div>

                  {/* CV / Resume Management */}
                  <div className="border border-[#d2d2d7] rounded-xl p-5 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-semibold text-[#1d1d1f] mb-1">CV / Resume</h3>
                        <p className="text-xs text-[#86868b]">
                          {cvInfo?.exists
                            ? `${cvInfo.filename} · ${(cvInfo.size / 1024).toFixed(0)} KB · Updated ${new Date(cvInfo.lastModified).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                            : "No CV uploaded yet."}
                        </p>
                      </div>
                    </div>

                    {cvInfo?.exists && (
                      <div className="flex items-center gap-2 mb-4">
                        <a
                          href={`/${cvInfo.filename}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed] transition"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          Preview
                        </a>
                        <a
                          href={`/${cvInfo.filename}`}
                          download
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#f5f5f7] text-[#0071e3] hover:bg-blue-50 transition"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          Download
                        </a>
                        <button
                          onClick={handleCvDelete}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#f5f5f7] text-red-500 hover:bg-red-50 transition"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    )}

                    <label
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed transition cursor-pointer ${
                        cvUploading ? 'border-[#d2d2d7] opacity-50' : 'border-[#d2d2d7] hover:border-[#0071e3] hover:bg-blue-50/30'
                      }`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#86868b]">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <span className="text-sm font-medium text-[#86868b]">
                        {cvUploading ? 'Uploading...' : cvInfo?.exists ? 'Upload new CV (replaces current)' : 'Upload CV (PDF)'}
                      </span>
                      <input
                        ref={cvInputRef}
                        type="file"
                        accept=".pdf,application/pdf"
                        className="hidden"
                        disabled={cvUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleCvUpload(file);
                        }}
                      />
                    </label>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .input-field {
          width: 100%;
          padding: 0.625rem 1rem;
          border-radius: 0.75rem;
          border: 1px solid #d2d2d7;
          background: #f5f5f7;
          color: #1d1d1f;
          font-size: 0.9375rem;
          transition: all 0.15s;
        }
        .input-field:focus {
          outline: none;
          border-color: #0071e3;
          box-shadow: 0 0 0 3px rgba(0,113,227,0.15);
        }
      `}</style>
    </>
  );
}

/* ============ Reusable Form Components ============ */

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-widest mb-1.5">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field"
      />
    </div>
  );
}

function TextArea({ label, value, onChange, onRemove }: { label: string; value: string; onChange: (v: string) => void; onRemove?: () => void }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <label className="text-xs font-semibold text-[#86868b] uppercase tracking-widest">
          {label}
        </label>
        {onRemove && (
          <button onClick={onRemove} className="text-xs text-red-500">Remove</button>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="input-field resize-y"
      />
    </div>
  );
}

function ImageField({ label, current, onUpload }: { label: string; current: string; onUpload: (file: File) => void }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-widest mb-1.5">
        {label}
      </label>
      <div className="flex items-center gap-4">
        {current && (
          <img src={current} alt="" className="w-16 h-16 rounded-xl object-cover border border-[#d2d2d7]" />
        )}
        <label className="cursor-pointer text-sm text-[#0071e3] font-medium hover:underline">
          Upload new
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
            }}
          />
        </label>
        <span className="text-xs text-[#86868b] truncate max-w-[200px]">{current}</span>
      </div>
    </div>
  );
}

/* ============ Platform Picker (Custom Dropdown) ============ */

function CustomSelect({ value, onChange, options, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} className="relative mb-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2.5 rounded-xl text-sm border border-black/5 bg-white text-left flex items-center justify-between gap-2 transition-all hover:border-black/10 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
      >
        <span style={{ color: selected ? "#1d1d1f" : "#c7c7cc" }}>
          {selected?.label || placeholder || "Select..."}
        </span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#86868b" strokeWidth="1.5" strokeLinecap="round">
          <path d={open ? "M2 6.5L5 3.5L8 6.5" : "M2 3.5L5 6.5L8 3.5"} />
        </svg>
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 top-[calc(100%+4px)] bg-white rounded-xl shadow-lg border border-black/8 z-50 overflow-hidden"
          style={{ animation: "fadeIn 0.15s ease" }}
        >
          <div className="max-h-52 overflow-y-auto py-1">
            {options.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={`w-full text-left text-sm px-3 py-2 transition-colors ${
                  value === o.value
                    ? "bg-[#0071e3] text-white"
                    : "text-[#1d1d1f] hover:bg-[#f5f5f7]"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const SOCIAL_PLATFORMS = [
  "LinkedIn", "GitHub", "Email", "Twitter / X", "Facebook", "Instagram",
  "YouTube", "TikTok", "Discord", "Slack", "Reddit", "Medium",
  "Dev.to", "Dribbble", "Behance", "Figma", "CodePen", "Stack Overflow",
  "Telegram", "WhatsApp", "Signal", "Mastodon", "Threads", "Bluesky",
  "Twitch", "Spotify", "SoundCloud", "Pinterest", "Snapchat",
  "LeetCode", "HackerRank", "Kaggle", "ResearchGate", "Google Scholar",
  "ORCID", "Portfolio", "Blog", "Website", "Other"
];

function PlatformPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = SOCIAL_PLATFORMS.filter(p =>
    p.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={ref} className="relative w-44">
      <button
        type="button"
        onClick={() => { setOpen(!open); setSearch(""); }}
        className="w-full input-field text-left text-sm flex items-center justify-between gap-2"
        style={{ cursor: "pointer" }}
      >
        <span style={{ color: value ? "#1d1d1f" : "#c7c7cc" }}>
          {value || "Select platform"}
        </span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#86868b" strokeWidth="1.5" strokeLinecap="round">
          <path d={open ? "M2 6.5L5 3.5L8 6.5" : "M2 3.5L5 6.5L8 3.5"} />
        </svg>
      </button>

      {open && (
        <div
          className="absolute left-0 top-[calc(100%+4px)] w-56 bg-white rounded-xl shadow-lg border border-black/8 z-50 overflow-hidden"
          style={{ animation: "fadeIn 0.15s ease" }}
        >
          {/* Search */}
          <div className="p-2 border-b border-black/5">
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search platforms..."
              className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-[#f5f5f7] outline-none placeholder-[#c7c7cc] text-[#1d1d1f]"
            />
          </div>

          {/* List */}
          <div className="max-h-48 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <p className="text-xs text-[#86868b] px-3 py-2">No results</p>
            )}
            {filtered.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => { onChange(p); setOpen(false); }}
                className={`w-full text-left text-sm px-3 py-1.5 transition-colors ${
                  value === p
                    ? "bg-[#0071e3] text-white"
                    : "text-[#1d1d1f] hover:bg-[#f5f5f7]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ============ CV Importer Component ============ */

function CVImporter({ onApply }: { onApply: (parsed: ParsedCV) => void }) {
  const [status, setStatus] = useState<"idle" | "uploading" | "ocr" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [errMsg, setErrMsg] = useState("");
  const [parsed, setParsed] = useState<ParsedCV | null>(null);
  const [rawText, setRawText] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const isImage = file.type.startsWith("image/");
    const isPDF = file.type === "application/pdf";
    if (!isImage && !isPDF) { setErrMsg("Please upload a PDF or image file."); setStatus("error"); return; }
    setErrMsg(""); setParsed(null);

    if (isImage) {
      setStatus("ocr"); setProgress(0);
      try {
        const Tesseract = await import("tesseract.js");
        const result = await Tesseract.recognize(file, "eng", {
          logger: (m: { status: string; progress: number }) => { if (m.status === "recognizing text") setProgress(Math.round(m.progress * 100)); },
        });
        const text = result.data.text;
        if (!text.trim()) { setErrMsg("Could not extract text from image."); setStatus("error"); return; }
        setRawText(text);
        const fd = new FormData(); fd.append("text", text);
        const res = await fetch("/api/admin/parse-cv", { method: "POST", body: fd });
        if (!res.ok) throw new Error((await res.json()).error || "Parse failed");
        const data = await res.json();
        setParsed(data.parsed); setStatus("done");
      } catch (err: unknown) { setErrMsg(err instanceof Error ? err.message : "OCR failed"); setStatus("error"); }
    } else {
      setStatus("uploading");
      try {
        const fd = new FormData(); fd.append("cv", file);
        const res = await fetch("/api/admin/parse-cv", { method: "POST", body: fd });
        if (!res.ok) throw new Error((await res.json()).error || "Parse failed");
        const data = await res.json();
        setRawText(data.text); setParsed(data.parsed); setStatus("done");
      } catch (err: unknown) { setErrMsg(err instanceof Error ? err.message : "Upload failed"); setStatus("error"); }
    }
  };

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); };
  const up = (key: keyof ParsedCV, value: unknown) => { if (parsed) setParsed({ ...parsed, [key]: value }); };

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1d1d1f] mb-2">Import CV</h2>
      <p className="text-sm text-[#86868b] mb-6">Upload your CV (PDF or image) to auto-fill portfolio content.</p>

      {status !== "done" && (
        <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition cursor-pointer ${dragOver ? "border-[#0071e3] bg-blue-50" : "border-[#d2d2d7] hover:border-[#86868b]"}`}
          onClick={() => fileRef.current?.click()}>
          <input ref={fileRef} type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          {(status === "idle" || status === "error") && (<><div className="text-4xl mb-3">📄</div><p className="text-sm font-medium text-[#1d1d1f]">Drop your CV here or click to browse</p><p className="text-xs text-[#86868b] mt-1">Supports PDF and images (JPG, PNG)</p></>)}
          {status === "uploading" && (<><div className="text-4xl mb-3 animate-bounce">⏳</div><p className="text-sm font-medium text-[#1d1d1f]">Extracting text from PDF...</p></>)}
          {status === "ocr" && (<><div className="text-4xl mb-3">🔍</div><p className="text-sm font-medium text-[#1d1d1f]">Running OCR... {progress}%</p><div className="w-48 mx-auto mt-3 h-1.5 rounded-full bg-[#f5f5f7] overflow-hidden"><div className="h-full bg-[#0071e3] transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} /></div></>)}
        </div>
      )}

      {errMsg && (<div className="mt-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">{errMsg}<button onClick={() => { setStatus("idle"); setErrMsg(""); }} className="ml-3 underline">Try again</button></div>)}

      {status === "done" && parsed && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#1d1d1f]">Extracted Data</h3>
            <div className="flex gap-3">
              <button onClick={() => { setStatus("idle"); setParsed(null); setRawText(""); }} className="text-sm text-[#86868b] hover:text-[#1d1d1f]">Upload Different CV</button>
              <button onClick={() => onApply(parsed)} className="bg-[#0071e3] text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-[#0077ed] transition">Apply to Portfolio</button>
            </div>
          </div>
          <p className="text-xs text-[#86868b] mb-4">Review and edit before applying. Empty fields will be skipped.</p>

          <div className="bg-[#f5f5f7] rounded-xl p-5 mb-4">
            <h4 className="text-xs font-bold text-[#86868b] uppercase tracking-widest mb-3">Basic Info</h4>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
              <div><label className="text-xs text-[#86868b] mb-1 block">Name</label><input className="input-field" value={parsed.name} onChange={(e) => up("name", e.target.value)} /></div>
              <div><label className="text-xs text-[#86868b] mb-1 block">Title</label><input className="input-field" value={parsed.title} onChange={(e) => up("title", e.target.value)} /></div>
              <div><label className="text-xs text-[#86868b] mb-1 block">Email</label><input className="input-field" value={parsed.email} onChange={(e) => up("email", e.target.value)} /></div>
              <div><label className="text-xs text-[#86868b] mb-1 block">LinkedIn</label><input className="input-field" value={parsed.linkedin} onChange={(e) => up("linkedin", e.target.value)} /></div>
            </div>
            <div className="mt-3"><label className="text-xs text-[#86868b] mb-1 block">Bio / Summary</label><textarea className="input-field resize-y" rows={3} value={parsed.bio} onChange={(e) => up("bio", e.target.value)} /></div>
          </div>

          <div className="bg-[#f5f5f7] rounded-xl p-5 mb-4">
            <h4 className="text-xs font-bold text-[#86868b] uppercase tracking-widest mb-3">Experience ({parsed.experience.length})</h4>
            {parsed.experience.map((exp, i) => (
              <div key={i} className="bg-white rounded-xl p-4 mb-2"><div className="grid grid-cols-3 gap-2 md:grid-cols-1">
                <input className="input-field" placeholder="Position" value={exp.position} onChange={(e) => { const u = [...parsed.experience]; u[i] = { ...u[i], position: e.target.value }; up("experience", u); }} />
                <input className="input-field" placeholder="Company" value={exp.company} onChange={(e) => { const u = [...parsed.experience]; u[i] = { ...u[i], company: e.target.value }; up("experience", u); }} />
                <input className="input-field" placeholder="Time" value={exp.time} onChange={(e) => { const u = [...parsed.experience]; u[i] = { ...u[i], time: e.target.value }; up("experience", u); }} />
              </div></div>
            ))}
            {parsed.experience.length === 0 && <p className="text-xs text-[#86868b] italic">No experience entries found</p>}
          </div>

          <div className="bg-[#f5f5f7] rounded-xl p-5 mb-4">
            <h4 className="text-xs font-bold text-[#86868b] uppercase tracking-widest mb-3">Education ({parsed.education.length})</h4>
            {parsed.education.map((edu, i) => (
              <div key={i} className="bg-white rounded-xl p-4 mb-2"><div className="grid grid-cols-3 gap-2 md:grid-cols-1">
                <input className="input-field" placeholder="Degree" value={edu.degree} onChange={(e) => { const u = [...parsed.education]; u[i] = { ...u[i], degree: e.target.value }; up("education", u); }} />
                <input className="input-field" placeholder="Institution" value={edu.place} onChange={(e) => { const u = [...parsed.education]; u[i] = { ...u[i], place: e.target.value }; up("education", u); }} />
                <input className="input-field" placeholder="Time" value={edu.time} onChange={(e) => { const u = [...parsed.education]; u[i] = { ...u[i], time: e.target.value }; up("education", u); }} />
              </div></div>
            ))}
            {parsed.education.length === 0 && <p className="text-xs text-[#86868b] italic">No education entries found</p>}
          </div>

          <div className="bg-[#f5f5f7] rounded-xl p-5 mb-4">
            <h4 className="text-xs font-bold text-[#86868b] uppercase tracking-widest mb-3">Skills ({parsed.skills.length})</h4>
            <div className="flex flex-wrap gap-2">
              {parsed.skills.map((skill, i) => (
                <span key={i} className="inline-flex items-center gap-1 bg-white px-3 py-1.5 rounded-full text-sm text-[#1d1d1f] border border-[#d2d2d7]">
                  {skill}<button onClick={() => up("skills", parsed.skills.filter((_, j) => j !== i))} className="text-[#86868b] hover:text-red-500 ml-1">×</button>
                </span>
              ))}
            </div>
            {parsed.skills.length === 0 && <p className="text-xs text-[#86868b] italic">No skills detected</p>}
          </div>

          <details className="mt-4">
            <summary className="text-xs text-[#86868b] cursor-pointer hover:text-[#1d1d1f]">View extracted raw text</summary>
            <pre className="mt-2 p-4 bg-[#f5f5f7] rounded-xl text-xs text-[#1d1d1f] whitespace-pre-wrap max-h-60 overflow-y-auto">{rawText}</pre>
          </details>
        </div>
      )}
    </div>
  );
}
