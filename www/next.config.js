/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["lexical-better-mentions"],
  productionBrowserSourceMaps: true,
};

module.exports = nextConfig;
