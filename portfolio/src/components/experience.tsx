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
  
  
  //const experience2 = calculateExperience(new Date('21-10-2021'), new Date('31-01-2022'));
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
        <span className="capitalize font-bold text-dark/75 dark:text-light/75 xs:text-xs sm:text-xs lg:text-sm xl:text-sm">
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
  const calculateExperience = (startDate: Date, endDate: Date) => {
    const timeDiff = endDate.getTime() - startDate.getTime();
    const years = Math.floor(timeDiff / (365 * 24 * 60 * 60 * 1000));
    const months = Math.floor((timeDiff % (365 * 24 * 60 * 60 * 1000)) / (30 * 24 * 60 * 60 * 1000));
    const days = Math.floor((timeDiff % (30 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));

    if (years === 0) {
      return `${months} months, ${days} days`;
    } else {
      return `${years} years, ${months} months, ${days} days`;
    }
  };

  const startDate = new Date('02-02-2022');
  const currentDate = new Date(); // Current date

  const experience1 = calculateExperience(startDate, currentDate);
  const experience2 = calculateExperience(new Date('10-21-2021'), new Date('01-31-2022'));

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
            time={`Feb-22 - Present ( ${experience1} )`}
            address="Akij House, 198 Bir Uttam, Mir Shawkat Sarak, Gulshan Link Road, Tejgaon, Dhaka-1208."
          />
          <Details
            position="Software Developer - Intern"
            company="Akij Venture Group"
            companyLinks="https://akijventure.com/"
            time={`Oct-12 - Jan-31 ( ${experience2} )`}
            address="Akij House, 198 Bir Uttam, Mir Shawkat Sarak, Gulshan Link Road, Tejgaon, Dhaka-1208."
          />
        </ul>
      </div>
    </div>
  );
};

export default Experience;
