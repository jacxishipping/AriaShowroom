import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#0B0F19",
        navy: {
          DEFAULT: "#0F172A",
          800: "#1E293B",
          900: "#0F172A",
          950: "#0B0F19",
        },
        gold: {
          DEFAULT: "#D97706",
          light: "#F59E0B",
          soft: "#FEF3C7",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-vazirmatn)", "system-ui", "sans-serif"],
        dari: ["var(--font-vazirmatn)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
