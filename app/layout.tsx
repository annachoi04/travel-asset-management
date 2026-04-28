import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "여행 자산관리",
  description: "여행 목표를 위한 스마트한 자산관리 도우미",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="bg-[var(--background)]">
      <body className="antialiased">{children}</body>
    </html>
  );
}
