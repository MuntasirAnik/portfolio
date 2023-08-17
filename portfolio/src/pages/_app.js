import "@/styles/globals.css";
import { Montserrat } from "next/font/google";
import Head from "next/head";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
// import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { AnimatePresence } from "framer-motion";

const monserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-mont",
});

export default function App({ Component, pageProps }) {
  const router = useRouter();
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initila-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main
        className={`${monserrat.variable} font-mont bg-light w-full min-h-screen dark:bg-dark:`}
      >
        <Navbar />
        <AnimatePresence mode="wait">
          <Component key={router.asPath} {...pageProps} />
        </AnimatePresence>

        <Footer />
      </main>
    </>
  );
}
