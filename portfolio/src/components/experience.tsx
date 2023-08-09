import React, { useRef } from "react";
import { motion, useScroll } from "framer-motion";

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
  return (
    <li className="my-8 first:mt-0 last:mb-0 w-[60%] mx-auto flex flex-col items-center justify-between">
      <div>
        <h3 className="capitalize font-bold text-2xl">{position}&nbsp;</h3>
        <span className="capitalize font-medium text-dark/75">
          <a
            href={companyLinks}
            target="_blank"
            className="capitalize underline"
          >
            {company}
          </a>
          <br />
        </span>
        <span className="capitalize font-medium text-dark/75">{time}</span>
        <br />
        <span className="font-medium w-full text-dark/80">{address}</span>
      </div>
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
    <div className="my-64">
      <h2 className="font-bold text-8xl mb-32 w-full text-center">
        Experience
      </h2>
      <div ref={ref} className="w-[75%] mx-auto relative">
        <motion.div
          style={{ scaleY: scrollYProgress }}
          className="absolute left-8 top-0 w-[4px] h-full bg-dark origin-top"
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
