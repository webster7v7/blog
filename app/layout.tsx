import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import TopTagBar from "@/components/TopTagBar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import ScrollToTop from "@/components/ScrollToTop";
import MouseGlow from "@/components/MouseGlow";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Webster | 个人博客",
  description: "在校大学生，探索代码与创意的交界，记录学习旅程中的思考碎片。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AnimatedBackground />
        <MouseGlow />
        <Header />
        <TopTagBar />
        <main className="pt-32 min-h-screen">
          {children}
        </main>
        <Footer />
        <ScrollToTop />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
