import React from "react";
import Image from "next/image";
import html from "../../public/skills/html.png";
import skillData from "../../public/skills"; // I assume skillData is an array of skill objects

const Skills = () => {
  return (
    <div className="w-full lg:h-screen p-2 pt-24 ">
      <div className="max-w-[1240px] mx-auto flex flex-col justify-center">
        <p className="text-xl tracking-widest uppercase text-[#5651e5]">
          skills
        </p>
        <h2 className="py-4">what I can do</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 ">
          {skillData.map((skill, index) => (
            <div
              key={index}
              className="p-6 shadow-xl rounded-xl hover:scale-105 ease-in duration-300
               dark:border-light dark:border-solid border-2"
            >
              <div className="grid grid-cols-2 gap-4 items-center justify-center">
                <div className="m-auto">
                  <Image src={skill.src} width={64} height={64} alt="HTML" />
                </div>
                <div className="flex flex-col items-center justify-center">
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
