import type { Metadata, Viewport } from "next";
import { connection } from "next/server";
import localFont from "next/font/local";
import { ThemeRegistry } from "./components/ThemeRegistry";
import Navbar from "./components/Navbar";
import { JsonLd } from "./components/JsonLd";
import { SmoothScroll } from "./components/SmoothScroll";
import { buildPersonJsonLd, buildWebSiteJsonLd } from "./lib/json-ld";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "./lib/site";
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
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  alternates: {
    types: {
      "application/rss+xml": [{ url: "/feed.xml", title: "witl.xyz Blog RSS" }],
    },
  },
};

export const viewport: Viewport = {
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
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await connection();

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <JsonLd data={buildWebSiteJsonLd()} />
        <JsonLd data={buildPersonJsonLd()} />
        <ThemeRegistry>
          <SmoothScroll />
          <Navbar />
          <main className="pt-[64px] md:pt-[72px]">{children}</main>
        </ThemeRegistry>
      </body>
    </html>
  );
}
