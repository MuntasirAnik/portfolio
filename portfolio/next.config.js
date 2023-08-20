/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      loader: "imgix",
      path: "/skills.ts", // This should match the public directory path
    },
  };
  
  module.exports = nextConfig;
  