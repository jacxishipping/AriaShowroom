"use client";

import { createTheme, ThemeOptions } from "@mui/material/styles";

export function getMuiTheme(mode: "light" | "dark") {
  const isDark = mode === "dark";

  const themeOptions: ThemeOptions = {
    palette: {
      mode,
      primary: {
        main: isDark ? "#D97706" : "#111318",
        light: isDark ? "#F59E0B" : "#272B35",
        dark: isDark ? "#B45309" : "#000000",
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#B45309",
        light: "#D97706",
        dark: "#92400E",
        contrastText: "#ffffff",
      },
      success: {
        main: "#047857",
        light: "#059669",
        dark: "#065F46",
        contrastText: "#ffffff",
      },
      warning: {
        main: "#B45309",
        light: "#D97706",
        dark: "#92400E",
        contrastText: "#ffffff",
      },
      error: {
        main: "#B91C1C",
        light: "#DC2626",
        dark: "#991B1B",
        contrastText: "#ffffff",
      },
      info: {
        main: "#334155",
        light: "#475569",
        dark: "#1E293B",
        contrastText: "#ffffff",
      },
      background: {
        default: isDark ? "#0A0C10" : "#F4F3EF",
        paper: isDark ? "#11141B" : "#FFFFFF",
      },
      text: {
        primary: isDark ? "#ECEEF2" : "#111318",
        secondary: isDark ? "#8E95A5" : "#646872",
      },
      divider: isDark ? "#1F2430" : "#E2E0D8",
    },
    shape: {
      borderRadius: 6,
    },
    typography: {
      fontFamily: "var(--font-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
      button: {
        textTransform: "none",
        fontWeight: 600,
      },
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontSize: "0.78rem",
            padding: "6px 14px",
            fontWeight: 600,
            letterSpacing: "0.01em",
            boxShadow: "none",
            "&:hover": {
              boxShadow: "none",
            },
          },
          outlined: {
            borderColor: isDark ? "#2A3040" : "#D6D3C9",
            "&:hover": {
              borderColor: isDark ? "#F59E0B" : "#111318",
              backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(17,19,24,0.03)",
            },
          },
          sizeSmall: {
            padding: "4px 10px",
            fontSize: "0.74rem",
          },
          sizeLarge: {
            padding: "8px 18px",
            fontSize: "0.85rem",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            backgroundImage: "none",
            border: isDark ? "1px solid #1F2430" : "1px solid #E2E0D8",
            boxShadow: "none",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            boxShadow: "none",
            border: isDark ? "1px solid #1F2430" : "1px solid #E2E0D8",
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            fontSize: "0.75rem",
            padding: "8px 12px",
            borderColor: isDark ? "#1B202B" : "#EAE8E1",
            lineHeight: 1.35,
          },
          sizeSmall: {
            padding: "6px 10px",
            fontSize: "0.75rem",
          },
          head: {
            fontWeight: 700,
            fontSize: "0.66rem",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            padding: "8px 12px",
            backgroundColor: isDark ? "#0D1017" : "#FAF9F6",
            color: isDark ? "#8E95A5" : "#646872",
            borderBottom: isDark ? "1px solid #242A38" : "1px solid #DCD9D0",
            whiteSpace: "nowrap",
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            "&:hover": {
              backgroundColor: isDark
                ? "rgba(255, 255, 255, 0.02) !important"
                : "rgba(17, 19, 24, 0.018) !important",
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: 4,
          },
          sizeSmall: {
            fontSize: "0.68rem",
            height: 20,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: "outlined",
          size: "small",
        },
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 6,
              fontSize: "0.8125rem",
            },
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
}
