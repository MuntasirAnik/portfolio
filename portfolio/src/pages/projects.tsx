import AnimatedText from "@/components/animatedText";
import { GithubIcon } from "@/components/icons";
import Layout from "@/components/layout";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import project1 from "../../public/images/projects/crypto-screener-cover-image.jpg";
import { motion } from "framer-motion";

const FramerImage = motion(Image);
interface ProjectProps {
  type: string;
  title: string;
  summary: string;
  img: string;
  link: string;
  github: string;
}

const FeaturedProject: React.FC<ProjectProps> = ({
  type,
  title,
  summary,
  img,
  link,
  github,
}) => {
  return (
    <article
      className="w-full flex items-center justify-between rounded-3xl border border-solid
     border-dark bg-light shadow-2xl p-12 relative rounde-br-2xl dark:bg-dark dark:border-solid dark:border-2 dark:border-light"
    >
      <div className="absolute top-0 -right-3 -z-10 w-[101%] h-[103%] rounded-[2.5rem] bg-dark rounded-br-3xl dark:bg-light" />
      <Link
        href={link}
        target="_blank"
        className="w-1/2 cursor-pointer overflow-hidden rounded-lg dark:border-solid dark:border-2"
      >
        <FramerImage
          src={img}
          alt={title}
          className="w-full h-auto"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4 }}
        />
      </Link>
      <div className="w-1/2 flex flex-col items-start justify-between pl-6 dark:text-light">
        <span className="font-medium text-xl">{type}</span>
        <Link
          href={link}
          target="_blank"
          className="hover:underline underline-offset-2"
        >
          <h2 className="my-2 w-full text-left text-3xl font-bold">{title}</h2>
        </Link>
        <p className="my-2 font-medium tetxt-dark">{summary}</p>
        <div className="mt-2 flex items-center">
          <Link href={github} target="_blank" className="w-10">
            <GithubIcon />
          </Link>
          <Link
            href={link}
            target="_blank"
            className="ml-4 rounded-lg bg-dark text-light p-2 px-6 text-lg font-semibold"
          >
            Visit Project
          </Link>
        </div>
      </div>
    </article>
  );
};

const Project: React.FC<ProjectProps> = ({
  type,
  title,
  summary,
  img,
  link,
  github,
}) => {
  return (
    <article
      className="w-full flex flex-col items-center justify-center rounded-2xl border border-solid border-dark
     bg-light p-6 relative dark:bg-dark dark:border-solid dark:border-2 dark:border-light"
    >
      <div className="absolute top-0 -right-3 -z-10 w-[101%] h-[103%] rounded-[2rem] bg-dark rounded-br-3xl dark:bg-light" />
      <Link
        href={link}
        target="_blank"
        className="w-full cursor-pointer overflow-hidden rounded-lg dark:border-solid dark:border-2 dark:border-light"
      >
        <FramerImage
          src={img}
          alt={title}
          className="w-full h-auto"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4 }}
        />
      </Link>
      <div className="w-full flex flex-col items-start justify-between mt-4 dark:text-light">
        <span className="font-medium text-xl">{type}</span>
        <Link
          href={link}
          target="_blank"
          className="hover:underline underline-offset-2"
        >
          <h2 className="my-1 w-full text-left text-2xl font-bold">{title}</h2>
        </Link>
        <div className="w-full flex items-center justify-between">
          <Link
            href={link}
            target="_blank"
            className="text-sm font-semibold underline"
          >
            Visits
          </Link>
          <Link href={github} target="_blank" className="w-8">
            <GithubIcon />
          </Link>
        </div>
      </div>
    </article>
  );
};

const Projects = () => {
  return (
    <>
      <Head>
        <title>about</title>
        <meta name="description" content="description" />
      </Head>
      <main className="w-full mb-16 flex flex-col items-center justify-center">
        <Layout className="pt-16">
          <AnimatedText
            text="Imagination Trumps Knowledge!"
            className="mb-16"
          />
          <div className="grid grid-cols-12 gap-24">
            <div className="col-span-12">
              <FeaturedProject
                type="Featured Project"
                title="Crypto Screener Application"
                img={project1}
                summary="Summary here"
                link="/"
                github="/"
              />
            </div>
            <div className="col-span-6">
              <Project
                type="Featured Project"
                title="Crypto Screener Application"
                img={project1}
                summary="Summary here"
                link="/"
                github="/"
              />
            </div>
            <div className="col-span-6">
              {" "}
              <Project
                type="Featured Project"
                title="Crypto Screener Application"
                img={project1}
                summary="Summary here"
                link="/"
                github="/"
              />
            </div>
          </div>
        </Layout>
      </main>
    </>
  );
};

export default Projects;
