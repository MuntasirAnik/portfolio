import AnimatedText from "@/components/animatedText";
import Layout from "@/components/layout";
import Head from "next/head";
import Image from "next/image";
import React, { useEffect, useRef } from "react";
import profilePic from "../../public/images/profile/profile-pic-3.jpeg";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import Skills from "@/components/skills";
import Experience from "@/components/experience";
import Education from "@/components/education";

interface AnimatedNumberProps {
  value: number;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value }) => {
  const ref = useRef(null);
  const motionValue = useMotionValue(0);
  const sprintValue = useSpring(motionValue, { duration: 5000 });
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    sprintValue.on("change", (latest) => {
      if (ref.current && latest.toFixed(0) <= value) {
        (ref.current as HTMLElement).textContent = latest.toFixed(0);
      }
    });
  }, [sprintValue, value]);

  return <span ref={ref}></span>;
};
const About = () => {
  return (
    <>
      <Head>
        <title>about</title>
        <meta name="description" content="description" />
      </Head>
      <main className="w-full flex flex-col items-center justify-center dark:text-light">
        <Layout className="pt-0">
          <AnimatedText text="Passion fuels purpose!" className="mb-16" />
          <div className="w-full grid grid-cols-8 gap-16">
            <div className="col-span-3 flex flex-col items-start justify-start">
              <h2 className="mb-4 text-lg font-bold uppercase text-dark/75 dark:text-light/75">
                Biography
              </h2>
              <p className="font-medium">
                Hi, I'm Muntasir, a web developer With almost 2 years of
                experience in the field. I am always looking for new and
                innovative ways to bring my clients' visions to life.
              </p>
              <p className="my-4 font-medium">
                I believe that it's about solving problems and creating
                intuitive, enjoyable experiences for users.
              </p>
              <p className="font-medium">
                Whether I'm working on a website, I bring my commitment and
                user-centered thinking to every project I work on. I look
                forward to the opportunity to bring my skills and passion to
                your next project.
              </p>
            </div>
            <div
              className="col-span-3 relative h-max rounded-2xl border-2 border-solid border-dark bg-light p-8
            dark:bg-dark dark:border-light"
            >
              <div className="absolute top-0 -right-3 -z-10 w-[102%] h-[103%] rounded-[2rem] bg-dark dark:bg-light" />
              <Image
                src={profilePic}
                alt="profile"
                className="w-full h-auto rounded-2xl"
                priority
                sizes="(max-width:768px) 100vw,
                (max-width: 1200px) 50vw,33vw"
              />
            </div>
            <div className="col-span-2 flex flex-col items-end justify-between">
              <div className="flex flex-col items-end justify-center">
                <span className="inline-block text-7xl font-bold">
                  <AnimatedNumber value={24} />
                </span>
                <h2 className="text-xl font-medium capitalize text-dark/75 dark:text-light/75">
                  months of experience
                </h2>
              </div>
            </div>
          </div>
          <Skills />
          <Experience />
          <Education />
        </Layout>
      </main>
    </>
  );
};

export default About;
