import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";
import ConditionalHeader from "@/components/ConditionalHeader";
import ConditionalTopTagBar from "@/components/ConditionalTopTagBar";
import ConditionalFooter from "@/components/ConditionalFooter";
import ConditionalMain from "@/components/ConditionalMain";
import ScrollToTop from "@/components/ScrollToTop";
import ResourcePreloader from "@/components/ResourcePreloader";
import { Toaster } from "sonner";

// 动态导入性能监控组件（仅客户端）
// 注意：WebVitals本身是'use client'组件，无需设置ssr:false
const WebVitals = dynamic(() => import("@/components/WebVitals"));

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
        <ResourcePreloader />
        <WebVitals />
        <ConditionalHeader />
        <ConditionalTopTagBar />
        <ConditionalMain>
          {children}
        </ConditionalMain>
        <ConditionalFooter />
        <ScrollToTop />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
