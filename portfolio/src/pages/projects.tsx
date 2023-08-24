import AnimatedText from "@/components/animatedText";
import { GithubIcon } from "@/components/icons";
import Layout from "@/components/layout";
import Head from "next/head";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import React from "react";
import ecom from "../../public/images/projects/ecom.png";
import akijventure from "../../public/images/projects/akijventure.png";
import { motion } from "framer-motion";
import TransitionEffect from "@/components/transitionEffect";

const FramerImage = motion(Image);
interface ProjectProps {
  type: string;
  title: string;
  summary: string;
  img: StaticImageData;
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
     border-dark bg-light shadow-2xl p-12 relative rounde-br-2xl dark:bg-dark dark:border-solid dark:border-2 dark:border-light
     lg:flex-col lg:p-8 xs:rounded-2xl xs:rounded-br-3xl xs:p-3"
    >
      <div
        className="absolute top-0 -right-3 -z-10 w-[101%] h-[103%] rounded-[2.5rem] bg-dark rounded-br-3xl dark:bg-light 
      md:-right-2 md:w-[101%] md:h-[102%] xs:rounded-[1.5rem]"
      />
      <Link
        href={link}
        target="_blank"
        className="w-1/2 cursor-pointer overflow-hidden rounded-lg dark:border-solid dark:border-2 lg:w-full "
      >
        <FramerImage
          src={img}
          alt={title}
          className="w-full h-auto"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4 }}
          priority
          sizes="(max-width:768px) 100vw,
                (max-width: 1200px) 50vw,50vw"
        />
      </Link>
      <div className="w-1/2 flex flex-col items-start justify-between pl-6 dark:text-light lg:w-full lg:pl-0 lg:pt-6">
        <span className="font-medium text-xl xs:text-base">{type}</span>
        <Link
          href={link}
          target="_blank"
          className="hover:underline underline-offset-2"
        >
          <h2 className="my-2 w-full text-left text-3xl font-bold sm:text-sm">
            {title}
          </h2>
        </Link>
        <p className="my-2 font-medium text-dark dark:text-light sm:text-sm">
          {summary}
        </p>
        <div className="mt-2 flex items-center">
          <Link href={github} target="_blank" className="w-10">
            <GithubIcon />
          </Link>
          <Link
            href={link}
            target="_blank"
            className="ml-4 rounded-lg bg-dark text-light p-2 px-6 text-lg font-semibold sm:px-4 sm:text-base"
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
     bg-light p-6 relative dark:bg-dark dark:border-solid dark:border-2 dark:border-light xs:p-4"
    >
      <div
        className="absolute top-0 -right-3 -z-10 w-[101%] h-[103%] rounded-[2rem] bg-dark rounded-br-3xl
       dark:bg-light xs:-right-2 sm:h-[102%] xs:w-[100%] xs:rounded-[1.5rem] "
      />
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
        <span className="font-medium text-xl lg:text-lg md:text-base">
          {type}
        </span>
        <Link
          href={link}
          target="_blank"
          className="hover:underline underline-offset-2"
        >
          <h2 className="my-1 w-full text-left text-2xl font-bold lg:text-2xl xs:text-sm">
            {title}
          </h2>
        </Link>
        <div className="w-full flex items-center justify-between">
          <Link
            href={link}
            target="_blank"
            className="text-sm font-semibold underline md:text-base xs:text-sm"
          >
            Visit
          </Link>
          <Link href={github} target="_blank" className="w-8 md:w-6">
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
        <title>muntasir - projects</title>
        <meta name="description" content="description" />
      </Head>
      <TransitionEffect />
      <main className="w-full flex flex-col items-center justify-center">
        <Layout className="pt-16">
          <AnimatedText
            text="Imagination Trumps Knowledge!"
            className="mb-16 lg:!text-7xl sm:!text-6xl xs:!text-4xl sm:mb-"
          />
          <div className="grid grid-cols-12 gap-24 xl:gap-x-16 lg:gap-x-8 md:gap-y-24 sm:gap-x-0">
            <div className="col-span-12">
              <FeaturedProject
                type="Featured Project"
                title="Akij ecom"
                img={ecom}
                summary="Next js, Tailwind CSS, Node js, Express, Sanity, MongoDB"
                link="https://shop.akijvg.net/"
                github="/"
              />
            </div>
            <div className="col-span-6 sm:col-span-12">
              <Project
                type=""
                title="Akij Venture Group Website"
                img={akijventure}
                summary="kij Venture Group e-commerce"
                link="https://www.akijventure.com/"
                github="/"
              />
            </div>
            {/* <div className="col-span-6 sm:col-span-12">
              <Project
                type=""
                title="Crypto Screener Application"
                img={ecom}
                summary="Summary here"
                link="/"
                github="/"
              />
            </div> */}
          </div>
        </Layout>
      </main>
    </>
  );
};

export default Projects;
