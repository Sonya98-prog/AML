import type { NextConfig } from "next";

// Для публикации на GitHub Pages (репозиторий AML → сайт /AML/).
// Локально переменная не задана — сайт работает на http://localhost:3000
const basePath = process.env.DEPLOY_FOR_PAGES ? "/AML" : "";

const nextConfig: NextConfig = {
  // Статический экспорт: на выходе папка out/ с готовыми HTML-файлами.
  output: "export",
  trailingSlash: true,
  ...(basePath ? { basePath } : {}),
  images: { unoptimized: true },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
