"use client";

import { createTheme, ThemeOptions } from "@mui/material/styles";

export function getMuiTheme(mode: "light" | "dark", customPrimary?: string, customRadius?: number) {
  const isDark = mode === "dark";
  const primaryColor = customPrimary || (isDark ? "#8AB4F8" : "#1A73E8");
  const radius = customRadius ?? 6;

  const themeOptions: ThemeOptions = {
    palette: {
      mode,
      primary: {
        main: primaryColor,
        light: primaryColor,
        dark: primaryColor,
        contrastText: isDark ? "#0F141C" : "#ffffff",
      },
      secondary: {
        main: "#1E293B",
        light: "#334155",
        dark: "#0F172A",
        contrastText: "#ffffff",
      },
      success: {
        main: "#16A34A",
        light: "#22C55E",
        dark: "#15803D",
        contrastText: "#ffffff",
      },
      warning: {
        main: "#D97706",
        light: "#F59E0B",
        dark: "#B45309",
        contrastText: "#ffffff",
      },
      error: {
        main: "#DC2626",
        light: "#EF4444",
        dark: "#B91C1C",
        contrastText: "#ffffff",
      },
      info: {
        main: "#1A73E8",
        light: "#4285F4",
        dark: "#1557B0",
        contrastText: "#ffffff",
      },
      background: {
        default: isDark ? "#0F141C" : "#F8FAFC",
        paper: isDark ? "#161B26" : "#FFFFFF",
      },
      text: {
        primary: isDark ? "#F1F5F9" : "#0F172A",
        secondary: isDark ? "#94A3B8" : "#475569",
      },
      divider: isDark ? "#262F40" : "#E2E8F0",
    },
    shape: {
      borderRadius: radius,
    },
    typography: {
      fontFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
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
            borderRadius: radius,
            fontSize: "0.78rem",
            padding: "6px 14px",
            fontWeight: 600,
            letterSpacing: "0.01em",
            boxShadow: "none",
            whiteSpace: "nowrap",
            "&:hover": {
              boxShadow: "none",
            },
          },
          outlined: {
            borderColor: isDark ? "#262F40" : "#CBD5E1",
            "&:hover": {
              borderColor: isDark ? "#8AB4F8" : "#1A73E8",
              backgroundColor: isDark ? "rgba(138,180,248,0.06)" : "rgba(26,115,232,0.04)",
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
            borderRadius: 8,
            backgroundImage: "none",
            border: isDark ? "1px solid #262F40" : "1px solid #E2E8F0",
            boxShadow: "none",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            boxShadow: "none",
            border: isDark ? "1px solid #262F40" : "1px solid #E2E8F0",
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            fontSize: "0.75rem",
            padding: "8px 12px",
            borderColor: isDark ? "#1E2636" : "#E2E8F0",
            lineHeight: 1.35,
          },
          sizeSmall: {
            padding: "7px 10px",
            fontSize: "0.75rem",
          },
          head: {
            fontWeight: 600,
            fontSize: "0.68rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            padding: "8px 12px",
            backgroundColor: isDark ? "#121722" : "#F8FAFC",
            color: isDark ? "#94A3B8" : "#475569",
            borderBottom: isDark ? "1px solid #262F40" : "1px solid #E2E8F0",
            whiteSpace: "nowrap",
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            "&:hover": {
              backgroundColor: isDark
                ? "rgba(138, 180, 248, 0.04) !important"
                : "rgba(26, 115, 232, 0.03) !important",
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
