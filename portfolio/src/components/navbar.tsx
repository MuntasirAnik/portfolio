import Link from "next/link";
import React from "react";
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

const Navbar = () => {
  const [mode, setMode] = useThemeSwitcher();
  return (
    <header
      className="w-full px-32 py-8 bg-light font-medium flex items-center justify-between dark:bg-dark
    dark:text-light"
    >
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
      <div className="absolute left-[50%] top-2 translate-x-[-50%]">
        <Logo />
      </div>
    </header>
  );
};

export default Navbar;
