import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeRegistry } from "./components/ThemeRegistry";
import Navbar from "./components/Navbar";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Tyler Witlin - DevOps Engineer",
  description:
    "DevOps Engineer specializing in Kubernetes, GitOps, CI/CD pipelines, and cloud-native infrastructure. CKA certified.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeRegistry>
          <Navbar />
          <main className="pt-[64px] md:pt-[72px]">{children}</main>
        </ThemeRegistry>
      </body>
    </html>
  );
}
