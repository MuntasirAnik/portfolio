import Link from "next/link";
import React, { useState } from "react";
import Logo from "./logo";
import { useRouter } from "next/router";
import LinkedIcon, { GithubIcon } from "./icons";
import { motion } from "framer-motion";
import useThemeSwitcher from "./hooks/useThemeSwitcher";
import SunIcon from "./icons";
import MoonIcon from "./icons";
import { BsFillSunFill } from "react-icons/bs";
import { BsFillMoonStarsFill } from "react-icons/bs";

interface CustomLinkProps {
  href: string;
  title: string;
  className?: string;
}
interface CustomMobileLinkProps {
  href: string;
  title: string;
  className?: string;
  toggle: any;
}
const CustomLink: React.FC<CustomLinkProps> = ({
  href,
  title,
  className = "",
}) => {
  const router = useRouter();
  return (
    <Link href={href} className={`${className} relative group`}>
      {title}
      <span
        className={`h-[1px] inline-block bg-dark absolute left-0 -bottom-0.5 group-hover:w-full 
        transition-[width] ease duration-300 dark:bg-light
        ${router.asPath === href ? "w-full" : "w-0"}`}
      >
        &nbsp;
      </span>
    </Link>
  );
};

const CustomMobileLink: React.FC<CustomMobileLinkProps> = ({
  href,
  title,
  className = "",
  toggle,
}) => {
  const router = useRouter();

  const handleClick = () => {
    toggle();
    router.push(href);
  };
  return (
    <button
      className={`${className} relative group text-light dark:text-dark my-2`}
      onClick={handleClick}
    >
      {title}
      <span
        className={`h-[1px] inline-block bg-light absolute left-0 -bottom-0.5 group-hover:w-full 
        transition-[width] ease duration-300 dark:bg-dark
        ${router.asPath === href ? "w-full" : "w-0"}`}
      >
        &nbsp;
      </span>
    </button>
  );
};

const Navbar = () => {
  const {mode, setMode} = useThemeSwitcher();
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header
      className="w-full px-32 py-8 bg-light font-medium flex items-center justify-between dark:bg-dark
    dark:text-light relative z-10 lg:px-16 md:px-12 sm:px-8"
    >
      <button
        className="lg:flex hidden flex-col items-center justify-center"
        onClick={handleClick}
      >
        <span
          className={`bg-dark dark:bg-light block transition-all duration-300 h-0.5 w-6 rounded-sm 
        ${isOpen ? "rotate-45 translate-y-1" : "-translate-y-0.5 "}`}
        ></span>
        <span
          className={`bg-dark dark:bg-light block transition-all duration-300 h-0.5 w-6 rounded-sm my-0.5 ${
            isOpen ? "opacity-0" : "opacity-100"
          }`}
        ></span>
        <span
          className={`bg-dark dark:bg-light block transition-all duration-300 h-0.5 w-6 rounded-sm ${
            isOpen ? "-rotate-45 -translate-y-1" : "translate-y-0.5 "
          }`}
        ></span>
      </button>
      <div className="w-full flex items-center justify-between lg:hidden">
        <nav>
          <CustomLink href={"/"} title="Home" className="mr-4" />
          <CustomLink href={"/about"} title="About" className="mx-4" />
          <CustomLink href={"/projects"} title="Projects" className="mx-4" />
          <CustomLink
            href={"/publications"}
            title="Publications"
            className="ml-4"
          />
        </nav>

        <nav className="flex items-center justify-center flex-wrap">
          <motion.a
            href="https://www.linkedin.com/in/muntasir-kader-anik-620a27143/"
            target={"_blank"}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.9 }}
            className="w-6 mr-3"
          >
            <LinkedIcon />
          </motion.a>
          <motion.a
            href="https://github.com/MuntasirAnik"
            target={"_blank"}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.9 }}
            className="w-6 mr-3 border border-solid dark:border-light rounded-lg"
          >
            <GithubIcon />
          </motion.a>
          <button
            onClick={() => setMode(mode === "light" ? "dark" : "light")}
            className="flex item-center justify-center rounded-full"
          >
            {mode === "dark" ? (
              <BsFillSunFill className="fill-light" />
            ) : (
              <BsFillMoonStarsFill className="fill-dark" />
            )}
          </button>
        </nav>
      </div>

      {isOpen ? (
        <motion.div
          initial={{ scale: 0, opacity: 0, x: "-50%", y: "-50%" }}
          animate={{ scale: 1, opacity: 1 }}
          className="min-w-[70vw] z-30 flex flex-col items-center justify-between fixed top-1/2 left-1/2 -translate-x-1/2
    -translate-y-1/2 bg-dark/90 dark:bg-light/75 backdrop-blur-md py-32 rounded-lg"
        >
          <nav className="flex items-center flex-col justify-center">
            <CustomMobileLink
              href={"/"}
              title="Home"
              className=""
              toggle={handleClick}
            />
            <CustomMobileLink
              href={"/about"}
              title="About"
              className=""
              toggle={handleClick}
            />
            <CustomMobileLink
              href={"/projects"}
              title="Projects"
              className=""
              toggle={handleClick}
            />
            <CustomMobileLink
              href={"/publications"}
              title="Publications"
              className=""
              toggle={handleClick}
            />
          </nav>

          <nav className="flex items-center justify-center flex-wrap mt-2">
            <motion.a
              href="https://www.linkedin.com/in/muntasir-kader-anik-620a27143/"
              target={"_blank"}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.9 }}
              className="w-6 mr-3"
            >
              <LinkedIcon />
            </motion.a>
            <motion.a
              href="https://github.com/MuntasirAnik"
              target={"_blank"}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.9 }}
              className="w-6 mr-3 border border-solid dark:border-light rounded-lg bg-light dark:bg-dark"
            >
              <GithubIcon />
            </motion.a>
            <button
              onClick={() => setMode(mode === "light" ? "dark" : "light")}
              className="flex item-center justify-center rounded-full"
            >
              {mode === "dark" ? (
                <BsFillSunFill className="fill-light dark:fill-dark" />
              ) : (
                <BsFillMoonStarsFill className="w-6 h-6 rounded-lg border border-solid dark:border-light p-1" />
              )}
            </button>
          </nav>
        </motion.div>
      ) : null}
      <div className="absolute left-[50%] top-2 translate-x-[-50%]">
        <Logo />
      </div>
    </header>
  );
};

export default Navbar;
