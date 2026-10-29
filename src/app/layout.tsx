import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "All Masjid Timing — Verified Iqamah & Jumu'ah Directory",
  description:
    "Open, community-driven platform for real-time Masjid Iqamah congregation timings, facilities, and open APIs worldwide.",
  keywords: [
    "masjid timing",
    "iqamah timing",
    "jamaat timing",
    "mosque prayer times",
    "jumuah timing",
    "srinagar masjid timing",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-emerald-100 selection:text-emerald-900">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
