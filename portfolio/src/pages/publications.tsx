import Layout from "@/components/layout";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import article from "../../public/images/articles/publications.png";
import { motion } from "framer-motion";

interface ArticleProps {
  img: string;
  title: string;
  summary: string;
  link: string;
}

const FramerImage = motion(Image);

const FeaturedArticle: React.FC<ArticleProps> = ({ img, title, link }) => {
  return (
    <li className="relative col-span-1 w-full p-4 bg-light border border-solid border-dark rounded-2xl">
      <div className="absolute top-0 -right-3 -z-10 w-[101%] h-[103%] rounded-[2.5rem] bg-dark rounded-br-3xl" />
      <Link
        href={link}
        target="_blank"
        className="w-full cursor-pointer overflow-hidden rounded-lg"
      >
        <FramerImage
          src={img}
          alt={title}
          className="w-full h-auto rounded-lg"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4 }}
        />
      </Link>
      <Link href={link} target="_blank">
        <h2 className="captalize text-2xl font-bold my-2 hover:underline">
          {title}
        </h2>
      </Link>
    </li>
  );
};
const Publications = () => {
  return (
    <>
      <Head>
        <title>publications</title>
        <meta name="description" content="description" />
      </Head>
      <main className="w-full mb-16 flex flex-col items-center justify-cnter overflow-hidden">
        <Layout className="pt-16">
          <ul className="grid grid-cols-2 gap-16">
            <li>
              <FeaturedArticle
                title="Banking Software Services: Current Status, Challenges, Impact and Prospects"
                link="https://link.springer.com/chapter/10.1007/978-981-19-9304-6_13"
                summary="summary"
                img={article}
              />
            </li>
          </ul>
        </Layout>
      </main>
    </>
  );
};

export default Publications;
