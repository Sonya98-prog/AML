import type { NextConfig } from "next";

// GitHub Pages serves project sites under /<repo-name>/, so production
// builds must be prefixed with /AML. `next build` always sets
// NODE_ENV=production, while `next dev` uses development - so local dev
// keeps working at http://localhost:3000 without the prefix.
const isBuild = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  ...(isBuild ? { basePath: "/AML" } : {}),
  images: { unoptimized: true },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
