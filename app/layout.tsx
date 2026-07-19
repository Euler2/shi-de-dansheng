import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "诗的诞生",
  description: "诗与故事：亲历名作诞生，或站在历史路口。知乎人文季作品。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
