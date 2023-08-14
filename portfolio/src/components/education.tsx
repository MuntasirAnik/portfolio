import React, { useRef } from "react";
import { motion, useScroll } from "framer-motion";
import LiIcon from "./liIcon";

interface DetailsProps {
  type: string;
  place: string;
  time: string;
}

const Details: React.FC<DetailsProps> = ({ type, time, place }) => {
  const ref = useRef(null);
  return (
    <li
      ref={ref}
      className="my-8 first:mt-0 last:mb-0 w-[60%] mx-auto flex flex-col items-start justify-between"
    >
      <LiIcon reference={ref} />
      <motion.div
        initial={{ y: 50 }}
        whileInView={{ y: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
      >
        <h3 className="capitalize font-bold text-2xl">{type}&nbsp;</h3>
        <span className="capitalize font-medium text-dark/75 dark:text-light/75">
          {time}
        </span>
        <br />
        <span className="capitalize font-medium text-dark/75 dark:text-light/75">
          {place}
        </span>
      </motion.div>
    </li>
  );
};

const Education = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center start"],
  });
  return (
    <div className="my-24">
      <h2 className="font-bold text-8xl mb-28 w-full text-center">Education</h2>
      <div ref={ref} className="w-[75%] mx-auto relative">
        <motion.div
          style={{ scaleY: scrollYProgress }}
          className="absolute left-9 top-3 w-[4px] h-full bg-dark origin-top dark:bg-light"
        />
        <ul className="w-full flex flex-col items-start justify-between ml-4">
          <Details
            type="Master of Science In Software Engineering"
            time="2019-present"
            place="Independent University, Bangladesh"
          />
          <Details
            type="Bachelor of Science In Computer Science"
            time="2014-2018"
            place="Independent University, Bangladesh"
          />
          <Details
            type="Higher Secondary School Certificate"
            time="2013"
            place="Government Collage, Gaibandha"
          />
          <Details
            type="Secondary School Certificate"
            time="2013"
            place="Ahmmed Uddin Shah Shishu Niketan School & Collage Gaibandha"
          />
        </ul>
      </div>
    </div>
  );
};

export default Education;
