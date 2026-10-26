"use client";

import { createTheme, ThemeOptions } from "@mui/material/styles";

function getContrastTextForHex(hex: string): string {
  const clean = hex.replace("#", "").trim();
  if (clean.length !== 6) return "#ffffff";
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.62 ? "#0F141C" : "#ffffff";
}

export function getMuiTheme(mode: "light" | "dark", customPrimary?: string, customRadius?: number) {
  const isDark = mode === "dark";
  const isDefaultBlue = !customPrimary || customPrimary.toUpperCase() === "#1A73E8";
  const primaryColor = isDefaultBlue ? (isDark ? "#8AB4F8" : "#1A73E8") : customPrimary;
  const radius = customRadius ?? 6;
  const primaryContrast = getContrastTextForHex(primaryColor);

  const themeOptions: ThemeOptions = {
    palette: {
      mode,
      primary: {
        main: primaryColor,
        light: primaryColor,
        dark: primaryColor,
        contrastText: primaryContrast,
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
        main: primaryColor,
        light: primaryColor,
        dark: primaryColor,
        contrastText: primaryContrast,
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
      fontFamily: "var(--font-inter), var(--font-vazirmatn), -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
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
            "&.MuiButton-containedPrimary": {
              backgroundColor: primaryColor,
              color: primaryContrast,
              "&:hover": {
                backgroundColor: primaryColor,
                filter: "brightness(0.92)",
              },
            },
          },
          outlined: {
            borderColor: isDark ? "#262F40" : "#CBD5E1",
            "&:hover": {
              borderColor: primaryColor,
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
            borderRadius: radius,
            backgroundImage: "none",
            border: isDark ? "1px solid #262F40" : "1px solid #E2E8F0",
            boxShadow: "none",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: radius,
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
            borderRadius: Math.max(4, Math.min(radius, 8)),
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
              borderRadius: radius,
              fontSize: "0.8125rem",
            },
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
}
