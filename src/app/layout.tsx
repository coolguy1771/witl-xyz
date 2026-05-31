import type { Metadata, Viewport } from "next";
import { connection } from "next/server";
import localFont from "next/font/local";
import { firaCode } from "./lib/code-font";
import { BootScreenGate } from "./components/BootScreenGate";
import { ThemeRegistry } from "./components/ThemeRegistry";
import Navbar from "./components/Navbar";
import { SmoothScroll } from "./components/SmoothScroll";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await connection();

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${firaCode.variable} antialiased`}>
        <ThemeRegistry>
          <BootScreenGate />
          <SmoothScroll />
          <Navbar />
          <main className="pt-[64px] md:pt-[72px]">{children}</main>
        </ThemeRegistry>
      </body>
    </html>
  );
}
