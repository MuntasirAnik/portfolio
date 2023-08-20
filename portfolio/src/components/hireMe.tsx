import React, { useEffect, useState } from "react";
import hiremeBlack from "../../public/images/web developer circle logo.svg";
import hiremeWhite from "../../public/images/web developer circle wh.svg";
import Image from "next/image";
import Link from "next/link";
import useThemeSwitcher from "./hooks/useThemeSwitcher";

const HireMe = () => {
  const {mode, setMode} = useThemeSwitcher();

  useEffect(() => {
    const storedValue = localStorage.getItem('theme');
    console.log("value "+ storedValue)
    if (storedValue) {
      setMode(storedValue);
    }
  }, []);

  return (
    <div
      className="fixed left-4 bottom-4 flex items-center justify-center overflow-hidden 
    md:right-8 md:left-auto md:top-0 md:bottom-auto md:absolute md:z-20 rounded-full "
    >
      <div className="w-44 h-auto flex items-center justify-center relative md:w-24 bg-dark">
            <Image
          src={hiremeWhite}
          alt="hireme"
          className={mode === 'dark' ? 'animate-spin-slow ' : 'animate-spin-slow bg-dark'}
        />
        <Link
          href="mailto:anik.muntasir005@gmail.com"
          target="_blank"
          className="flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
          bg-dark text-dark shadow-md border border-solid border-dark w-20 h-20
          rounded-full font-semibold hover:bg-light hover:text-dark dark:bg-light dark:text-dark hover:dark:bg-dark
          hover:border-light md:w-12 md:h-12 md:text-[10px] bg-gradient-to-r from-green-400 to-blue-500"
        >
          Hire Me
        </Link>
      </div>
    </div>
  );
};

export default HireMe;

