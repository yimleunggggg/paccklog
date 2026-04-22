import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PACKLOG 行前志",
  description: "出发前，把每一件放进它该去的地方。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className="h-full antialiased"
      style={
        {
          "--font-packlog-sans":
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
          "--font-packlog-serif": 'Georgia, "Times New Roman", serif',
        } as CSSProperties
      }
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
