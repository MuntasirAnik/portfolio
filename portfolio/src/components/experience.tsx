import React, { useRef } from "react";
import { motion, useScroll } from "framer-motion";
import LiIcon from "./liIcon";

interface DetailsProps {
  position: string;
  company: string;
  companyLinks: string;
  time: string;
  address: string;
}

const Details: React.FC<DetailsProps> = ({
  position,
  company,
  companyLinks,
  time,
  address,
}) => {
  const ref = useRef(null);
  return (
    <li
      ref={ref}
      className="my-8 first:mt-0 last:mb-0 w-[60%] mx-auto flex flex-col items-center justify-between md:w-[80%]"
    >
      <LiIcon reference={ref} />
      <motion.div
        initial={{ y: 50 }}
        whileInView={{ y: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
      >
        <h3 className="capitalize font-bold text-2xl sm:text-xl xs:text-lg">
          {position}&nbsp;
        </h3>
        <span className="capitalize font-medium text-dark/75 dark:text-light">
          <a
            href={companyLinks}
            target="_blank"
            className="capitalize underline dark:text-primaryDark"
          >
            {company}
          </a>
          <br />
        </span>
        <span className="capitalize font-medium text-dark/75 dark:text-light/75 xs:text-sm">
          {time}
        </span>
        <br />
        <span className="font-medium w-full text-dark/80 dark:text-light/80 xs:text-sm">
          {address}
        </span>
      </motion.div>
    </li>
  );
};

const Experience = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center start"],
  });
  return (
    <div className="">
      <h2 className="font-bold text-8xl mt-16 mb-32 w-full text-center md:text-6xl xs:text-4xl md:mb-16 text-[#5651e5]">
        Experience
      </h2>
      <div ref={ref} className="w-[75%] mx-auto relative lg:w-[90%] md:w-full">
        <motion.div
          style={{ scaleY: scrollYProgress }}
          className="absolute left-9 top-0 w-[4px] h-full bg-dark dark:text-light origin-top dark:bg-light 
          md:w-[2px] md:left-[30px] xs:left-[20px]"
        />
        <ul className="w-full flex flex-col items-start justify-between ml-4 xs:ml-2">
          <Details
            position="Software Developer"
            company="Akij Venture Group"
            companyLinks="https://akijventure.com/"
            time="2022-Present"
            address="Akij House, 198 Bir Uttam, Mir Shawkat Sarak, Gulshan Link Road, Tejgaon, Dhaka-1208."
          />
          <Details
            position="Software Developer - Intern"
            company="Akij Venture Group"
            companyLinks="https://akijventure.com/"
            time="Oct-21 -Jan-2022"
            address="Akij House, 198 Bir Uttam, Mir Shawkat Sarak, Gulshan Link Road, Tejgaon, Dhaka-1208."
          />
        </ul>
      </div>
    </div>
  );
};

export default Experience;
