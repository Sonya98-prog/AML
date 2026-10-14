import type { Metadata, Viewport } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "AML Академия · обучение по COMITA AML",
  description:
    "Корпоративная обучающая платформа по COMITA AML: домен ПОД/ФТ, 115-ФЗ, компоненты продукта, ЭДО с регуляторами. Индивидуальный прогресс каждого сотрудника.",
  keywords: ["COMITA AML", "ПОД/ФТ", "115-ФЗ", "обучение", "AML", "Комита"],
};

export const viewport: Viewport = {
  themeColor: "#0b1b33",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${manrope.variable} ${inter.variable} font-sans antialiased bg-background text-foreground`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
