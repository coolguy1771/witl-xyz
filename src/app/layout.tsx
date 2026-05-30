import type { Metadata } from "next";
import localFont from "next/font/local";
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

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/**
 * Application root layout that applies global fonts and theme, renders the navbar, and mounts page content.
 *
 * @param children - Page content to render inside the layout's main region (includes top padding responsive at `md`)
 * @returns The root HTML structure including `<html>`, `<body>`, the theme registry, `Navbar`, and a `<main>` that contains `children`
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeRegistry>
          <SmoothScroll />
          <Navbar />
          <main className="pt-[64px] md:pt-[72px]">{children}</main>
        </ThemeRegistry>
      </body>
    </html>
  );
}
