import type { Metadata } from "next";
import { Manrope, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Daily Focus",
  description: "Timeline-first daily planner for focused work.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${manrope.variable} ${notoSansJp.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
