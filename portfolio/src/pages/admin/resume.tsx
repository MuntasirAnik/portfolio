import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Inter } from "next/font/google";
import type { SiteContent } from "@/lib/content";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function ResumePage() {
  const router = useRouter();
  const [content, setContent] = useState<SiteContent | null>(null);

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => {
        if (r.status === 401) { router.push("/admin/login"); return null; }
        return r.json();
      })
      .then((data) => { if (data) setContent(data); })
      .catch(() => {});
  }, [router]);

  if (!content) {
    return (
      <div className={`${inter.variable} font-inter min-h-screen bg-white flex items-center justify-center`}>
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  const { hero, about, experience, education, skills, publication, social } = content;

  return (
    <>
      <Head>
        <title>Resume — {hero.name}</title>
        <style>{`
          @media print {
            .no-print { display: none !important; }
            body { margin: 0; }
            .resume-page { padding: 0 !important; }
          }
        `}</style>
      </Head>

      {/* Controls Bar — hidden on print */}
      <div className={`${inter.variable} font-inter no-print sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200`}>
        <div className="max-w-[800px] mx-auto px-6 h-12 flex items-center justify-between">
          <button
            onClick={() => router.push("/admin")}
            className="text-sm text-gray-500 hover:text-gray-900 transition"
          >
            ← Back to Admin
          </button>
          <button
            onClick={() => window.print()}
            className="bg-[#0071e3] text-white text-sm font-medium px-5 py-1.5 rounded-full hover:bg-[#0077ed] transition"
          >
            Download PDF
          </button>
        </div>
      </div>

      {/* Resume Content */}
      <div className={`${inter.variable} font-inter resume-page max-w-[800px] mx-auto px-6 py-10`}>
        {/* Header */}
        <header className="mb-8 pb-6 border-b-2 border-gray-900">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{hero.name}</h1>
          <p className="text-lg text-gray-600 mt-1">{hero.title}</p>
          <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
            <a href={`mailto:${social.email}`} className="hover:text-gray-900">{social.email}</a>
            <span>·</span>
            <a href={social.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-gray-900">LinkedIn</a>
            <span>·</span>
            <a href={social.github} target="_blank" rel="noopener noreferrer" className="hover:text-gray-900">GitHub</a>
          </div>
        </header>

        {/* Summary */}
        <section className="mb-7">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-2 border-b border-gray-300 pb-1">Summary</h2>
          <p className="text-sm text-gray-700 leading-relaxed">{about.bio[0]}</p>
        </section>

        {/* Experience */}
        <section className="mb-7">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3 border-b border-gray-300 pb-1">Experience</h2>
          {experience.map((exp, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between items-baseline">
                <h3 className="text-sm font-bold text-gray-900">{exp.position}</h3>
                <span className="text-xs text-gray-500 whitespace-nowrap">{exp.time}</span>
              </div>
              <p className="text-sm text-gray-600">{exp.company}</p>
            </div>
          ))}
        </section>

        {/* Education */}
        <section className="mb-7">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3 border-b border-gray-300 pb-1">Education</h2>
          {education.map((edu, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between items-baseline">
                <h3 className="text-sm font-bold text-gray-900">{edu.degree}</h3>
                <span className="text-xs text-gray-500 whitespace-nowrap">{edu.time}</span>
              </div>
              <p className="text-sm text-gray-600">{edu.place}</p>
            </div>
          ))}
        </section>

        {/* Skills */}
        <section className="mb-7">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-2 border-b border-gray-300 pb-1">Technical Skills</h2>
          <p className="text-sm text-gray-700">
            {skills.map((s) => s.name).join(" · ")}
          </p>
        </section>

        {/* Publication */}
        <section className="mb-7">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-2 border-b border-gray-300 pb-1">Publication</h2>
          <p className="text-sm text-gray-700 font-medium">{publication.title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{publication.publisher}</p>
        </section>
      </div>
    </>
  );
}
