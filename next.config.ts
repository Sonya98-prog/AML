import type { NextConfig } from "next";

// STATIC_EXPORT=1 — сборка статического сайта для GitHub Pages:
//  output: 'export' → папка out/, basePath '/AML' → работа по адресу
//  https://<логин>.github.io/AML/
// Без переменной — обычный серверный режим для локальной разработки.
const isStatic = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  ...(isStatic
    ? {
        output: "export",
        trailingSlash: true,
        basePath: "/AML",
        assetPrefix: "/AML",
        images: { unoptimized: true },
      }
    : {}),
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
