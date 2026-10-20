import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0a1f44",
          50: "#eef2f8",
          100: "#d4dcef",
          200: "#a9b9df",
          300: "#6f82bf",
          400: "#3f4f8f",
          500: "#0a1f44",
          600: "#081a39",
          700: "#06142e",
          800: "#040e22",
          900: "#020917",
        },
        "navy-600": "#081a39",
        "navy-700": "#06142e",
        gold: {
          DEFAULT: "#d4af37",
          light: "#e6c75c",
          dark: "#b8932e",
        },
        "gold-light": "#e6c75c",
        "gold-dark": "#b8932e",
      },
      fontFamily: {
        sans: ["system-ui", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
