/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "var(--text-foreground)",
            a: {
              color: "var(--primary)",
              "&:hover": {
                color: "var(--primary-light)",
              },
            },
            h1: {
              color: "var(--text-foreground)",
            },
            h2: {
              color: "var(--text-foreground)",
            },
            h3: {
              color: "var(--text-foreground)",
            },
            h4: {
              color: "var(--text-foreground)",
            },
            code: {
              color: "var(--primary-light)",
            },
            pre: {
              backgroundColor: "#111118",
              color: "#E4E4E7",
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
  safelist: [
    "my-4",
    "p-4",
    "rounded-lg",
    "border-l-4",
    "bg-blue-50",
    "dark:bg-blue-900/20",
    "border-blue-500",
    "bg-yellow-50",
    "dark:bg-yellow-900/20",
    "border-yellow-500",
    "bg-green-50",
    "dark:bg-green-900/20",
    "border-green-500",
    "bg-gray-50",
    "dark:bg-gray-900/20",
    "border-gray-500",
    "overflow-x-auto",
    "text-sm",
    "transition-colors",
  ],
};
