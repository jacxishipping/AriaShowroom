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
        primary: {
          DEFAULT: "#2563EB",
          dark: "#1D4ED8",
          light: "#60A5FA",
        },
        error: {
          DEFAULT: "#DC2626",
          dark: "#B91C1C",
        },
        obsidian: "#0A0E17",
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
        mui: {
          primary: "#1976D2",
          "primary-dark": "#115293",
          "primary-light": "#42A5F5",
          secondary: "#9C27B0",
          success: "#2E7D32",
          warning: "#ED6C02",
          error: "#D32F2F",
          info: "#0288D1",
          paper: "#FFFFFF",
          "paper-dark": "#121824",
          background: "#F4F6F8",
          "background-dark": "#0A0E17",
          border: "rgba(0, 0, 0, 0.12)",
          "border-dark": "rgba(255, 255, 255, 0.12)",
          hover: "rgba(0, 0, 0, 0.04)",
          "hover-dark": "rgba(255, 255, 255, 0.08)",
          selected: "rgba(25, 118, 210, 0.08)",
          "selected-dark": "rgba(25, 118, 210, 0.16)",
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        "2xs": "0 1px 2px 0 rgba(15, 23, 42, 0.04)",
        xs: "0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)",
        "mui-1": "0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)",
        "mui-2": "0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)",
        "mui-3": "0px 3px 3px -2px rgba(0,0,0,0.2), 0px 3px 4px 0px rgba(0,0,0,0.14), 0px 1px 8px 0px rgba(0,0,0,0.12)",
        "mui-4": "0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)",
        "mui-8": "0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)",
        "mui-16": "0px 8px 10px -5px rgba(0,0,0,0.2), 0px 16px 24px 2px rgba(0,0,0,0.14), 0px 6px 30px 5px rgba(0,0,0,0.12)",
        "mui-24": "0px 11px 15px -7px rgba(0,0,0,0.2), 0px 24px 38px 3px rgba(0,0,0,0.14), 0px 9px 46px 8px rgba(0,0,0,0.12)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-vazirmatn)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        dari: ["var(--font-vazirmatn)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
