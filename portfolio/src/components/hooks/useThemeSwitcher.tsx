import { useEffect, useState } from "react";

const useThemeSwitcher = () => {
  const [mode, setMode] = useState<string>("dark");

  useEffect(() => {
    const userPref = window.localStorage.getItem("theme");
    if (userPref) {
      setMode(userPref);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setMode(prefersDark ? "dark" : "light");
    }
  }, []);

  useEffect(() => {
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
    window.localStorage.setItem("theme", mode);
  }, [mode]);

  return { mode, setMode };
};

export default useThemeSwitcher;
