import "@/styles/globals.css";
import { Montserrat } from "next/font/google";
import Head from "next/head";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

const monserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-mont",
});

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initila-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main
        className={`${monserrat.variable} font-mont bg-light w-full min-h-screen`}
      >
        <Navbar />
        <Component {...pageProps} />
        <Footer />
      </main>
    </>
  );
}
