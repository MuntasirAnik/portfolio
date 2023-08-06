import Link from "next/link";
import React from "react";
import Logo from "./logo";
import { useRouter } from "next/router";
import LinkedIcon, { GithubIcon } from "./icons";
import { motion } from "framer-motion";

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
        className={`h-[1px] inline-block bg-dark absolute left-0 -bottom-0.5 group-hover:w-full transition-[width] ease duration-300
        ${router.asPath === href ? "w-full" : "w-0"}`}
      >
        &nbsp;
      </span>
    </Link>
  );
};

const Navbar = () => {
  return (
    <header className="w-full px-32 py-8 font-medium flex items-center justify-between">
      <nav>
        <CustomLink href={"/"} title="Home" className="mr-4" />
        <CustomLink href={"/about"} title="About" className="mx-4" />
        <CustomLink href={"/projects"} title="Projects" className="mx-4" />
        <CustomLink href={"/article"} title="Articles" className="ml-4" />
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
          className="w-6 mr-3"
        >
          <GithubIcon />
        </motion.a>
      </nav>
      <div className="absolute left-[50%] top-2 translate-x-[-50%]">
        <Logo />
      </div>
    </header>
  );
};

export default Navbar;
