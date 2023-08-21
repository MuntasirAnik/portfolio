import React from "react";
import Image from "next/image";
import skillData from "../../public/skills"; 

const Skills = () => {
  return (
    <div className="w-full p-2 pt-24 ">
      <div className="max-w-[1240px] mx-auto flex flex-col justify-center">
        <p className="font-bold text-8xl mb-32 w-full text-center md:text-6xl xs:text-4xl md:mb-8 text-[#3f85cc]">
          Skills
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 xl:grid-cols-2 2xl:grid-cols-2 sm:grid-cols-1 3xl:grid-cols-2">
          {skillData.map((skill, index) => (
            <div
              key={index}
              className="p-6 shadow-xl rounded-xl hover:scale-105 ease-in duration-300
               dark:border-light dark:border-solid border-2"
            >
              <div className="grid grid-cols-2 gap-4 items-center justify-center ">
                <div className="m-auto">
                  <Image src={skill.src} width={64} height={64} alt="HTML" className="dark:bg-light rounded-xl p-1" />
                </div>
                <div className="flex flex-col items-center justify-center sm:text-sm">
                  <h3>{skill.skill}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Skills;
