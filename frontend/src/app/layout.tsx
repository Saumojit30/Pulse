import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pulse — Autonomous GTM Operating System",
  description: "24/7 Market Sensing, Seltz AI Web Indexing, Anti-Hallucination Audit, and Closed-Loop Revenue Execution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090A0C] text-[#F4F4F6] antialiased selection:bg-[#2D3039] selection:text-white">
        {children}
      </body>
    </html>
  );
}
