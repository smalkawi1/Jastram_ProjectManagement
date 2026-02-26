import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jastram PM | Project Management",
  description: "Project Progress & Resource Planner — Jastram Engineering Ltd.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.variable} antialiased flex min-h-screen`}>
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
          <main className="flex-1 p-6 bg-[#f0f5fb]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
