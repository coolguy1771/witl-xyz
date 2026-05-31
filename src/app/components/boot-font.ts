import localFont from "next/font/local";

/** RHEL console monospace (DejaVu ships with RHEL; Liberation Mono is the other common tty font). */
export const bootConsoleFont = localFont({
  src: [
    {
      path: "../fonts/boot/DejaVuSansMono.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/boot/DejaVuSansMono-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-boot-console",
  display: "block",
  preload: true,
});

/** Apply variable + class so tty text always renders in DejaVu Sans Mono. */
export const bootConsoleFontClassName = `${bootConsoleFont.variable} ${bootConsoleFont.className}`;
