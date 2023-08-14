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
      className="my-8 first:mt-0 last:mb-0 w-[60%] mx-auto flex flex-col items-center justify-between"
    >
      <LiIcon reference={ref} />
      <motion.div
        initial={{ y: 50 }}
        whileInView={{ y: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
      >
        <h3 className="capitalize font-bold text-2xl">{position}&nbsp;</h3>
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
        <span className="capitalize font-medium text-dark/75 dark:text-light/75">
          {time}
        </span>
        <br />
        <span className="font-medium w-full text-dark/80 dark:text-light/80">
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
      <h2 className="font-bold text-8xl mb-32 w-full text-center">
        Experience
      </h2>
      <div ref={ref} className="w-[75%] mx-auto relative">
        <motion.div
          style={{ scaleY: scrollYProgress }}
          className="absolute left-9 top-0 w-[4px] h-full bg-dark dark:text-light origin-top dark:bg-light"
        />
        <ul className="w-full flex flex-col items-start justify-between ml-4">
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
