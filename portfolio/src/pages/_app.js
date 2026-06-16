import "@/styles/globals.css";
import { Inter } from "next/font/google";
import Head from "next/head";
import Script from "next/script";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import ScrollProgress from "../components/scrollProgress";
import CustomCursor from "../components/customCursor";
import Preloader from "../components/preloader";
import { LanguageProvider } from "../hooks/useLanguage";
import SiteUnavailable from "../components/siteUnavailable";
import { ToastProvider } from "../components/toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://muntasiranik.com";
const ANALYTICS_URL = process.env.NEXT_PUBLIC_ANALYTICS_URL;
const ANALYTICS_ID = process.env.NEXT_PUBLIC_ANALYTICS_ID;

const pageVariants = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  enter: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -12, filter: "blur(4px)" },
};

const pageTransition = {
  duration: 0.4,
  ease: [0.22, 1, 0.36, 1],
};

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isAdmin = router.pathname.startsWith("/admin");
  const isApi = router.pathname.startsWith("/api");
  const [siteEnabled, setSiteEnabled] = useState(true);
  const [customCursor, setCustomCursor] = useState(true);
  const [checkDone, setCheckDone] = useState(false);

  // Register service worker (must be before any conditional return)
  useEffect(() => {
    if (!isAdmin && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, [isAdmin]);

  // Check site availability for public visitors
  useEffect(() => {
    if (isAdmin || isApi) {
      setCheckDone(true);
      return;
    }
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        setSiteEnabled(data.siteEnabled !== false);
        setCustomCursor(data.customCursor !== false);
        setCheckDone(true);
      })
      .catch(() => {
        setSiteEnabled(true);
        setCheckDone(true);
      });
  }, [isAdmin, isApi]);

  if (isAdmin) {
    return <ToastProvider><Component {...pageProps} /></ToastProvider>;
  }

  // Show unavailable page when site is disabled
  if (checkDone && !siteEnabled) {
    return (
      <>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Coming Soon — Muntasir Anik</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <ToastProvider>
          <SiteUnavailable />
          <Footer />
        </ToastProvider>
      </>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Muntasir Anik",
    jobTitle: "Software Engineer",
    url: SITE_URL,
    sameAs: [
      "https://www.linkedin.com/in/muntasir-kader-anik-620a27143/",
      "https://github.com/MuntasirAnik",
    ],
    email: "anik.muntasir005@gmail.com",
    knowsAbout: [
      "TypeScript", "JavaScript", "React", "Next.js", "Node.js",
      "NestJS", "C#", ".NET Core", "SQL", "MongoDB",
    ],
  };

  return (
    <ToastProvider>
    <LanguageProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1d1d1f" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />

        {/* Default SEO */}
        <title>Muntasir Anik — Software Engineer</title>
        <meta name="description" content="Software Engineer with 4+ years of full-stack expertise. Building innovative web applications with React, Next.js, Node.js, and .NET." />
        <meta name="author" content="Muntasir Anik" />
        <link rel="canonical" href={SITE_URL} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:title" content="Muntasir Anik — Software Engineer" />
        <meta property="og:description" content="Software Engineer with 4+ years of full-stack expertise. Building innovative web applications with React, Next.js, Node.js, and .NET." />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Muntasir Anik — Software Engineer" />
        <meta property="og:site_name" content="Muntasir Anik" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Muntasir Anik — Software Engineer" />
        <meta name="twitter:description" content="Software Engineer with 4+ years of full-stack expertise." />
        <meta name="twitter:image" content={`${SITE_URL}/og-image.png`} />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      {/* Analytics (Umami / Google Analytics / any) */}
      {ANALYTICS_URL && ANALYTICS_ID && (
        <Script
          src={ANALYTICS_URL}
          data-website-id={ANALYTICS_ID}
          strategy="afterInteractive"
        />
      )}

      <ScrollProgress />
      {customCursor && <CustomCursor />}

      <Navbar />

      <Preloader>
        <main className={`${inter.variable} font-inter${customCursor ? ' custom-cursor-active' : ''}`} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, paddingBottom: '36px' }}>
            <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
              <motion.div
                key={router.pathname}
                variants={pageVariants}
                initial="hidden"
                animate="enter"
                exit="exit"
                transition={pageTransition}
              >
                <Component {...pageProps} />
              </motion.div>
            </AnimatePresence>
          </div>
          <Footer />
        </main>
      </Preloader>
    </LanguageProvider>
    </ToastProvider>
  );
}
