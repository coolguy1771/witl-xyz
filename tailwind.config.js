/** @type {import('tailwindcss').Config} */
module.exports = {
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
};
