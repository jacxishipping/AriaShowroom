"use client";

import { createTheme, ThemeOptions } from "@mui/material/styles";

export function getMuiTheme(mode: "light" | "dark") {
  const isDark = mode === "dark";

  const themeOptions: ThemeOptions = {
    palette: {
      mode,
      primary: {
        main: "#1976d2",
        light: "#42a5f5",
        dark: "#1565c0",
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#d97706",
        light: "#f59e0b",
        dark: "#b45309",
        contrastText: "#ffffff",
      },
      success: {
        main: "#2e7d32",
        light: "#4caf50",
        dark: "#1b5e20",
        contrastText: "#ffffff",
      },
      warning: {
        main: "#ed6c02",
        light: "#ff9800",
        dark: "#e65100",
        contrastText: "#ffffff",
      },
      error: {
        main: "#d32f2f",
        light: "#ef5350",
        dark: "#c62828",
        contrastText: "#ffffff",
      },
      info: {
        main: "#0288d1",
        light: "#03a9f4",
        dark: "#01579b",
        contrastText: "#ffffff",
      },
      background: {
        default: isDark ? "#0b0f19" : "#f8fafc",
        paper: isDark ? "#121824" : "#ffffff",
      },
      text: {
        primary: isDark ? "#f8fafc" : "#0f172a",
        secondary: isDark ? "#94a3b8" : "#64748b",
      },
      divider: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
    },
    shape: {
      borderRadius: 8,
    },
    typography: {
      fontFamily: "var(--font-inter), 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
      button: {
        textTransform: "none",
        fontWeight: 600,
      },
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: false,
        },
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontSize: "0.8125rem",
            padding: "6px 14px",
            boxShadow: isDark
              ? "0 1px 3px rgba(0, 0, 0, 0.4)"
              : "0 1px 2px rgba(0, 0, 0, 0.05)",
            "&:hover": {
              boxShadow: isDark
                ? "0 4px 6px rgba(0, 0, 0, 0.6)"
                : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            },
          },
          sizeSmall: {
            padding: "4px 10px",
            fontSize: "0.75rem",
          },
          sizeLarge: {
            padding: "8px 20px",
            fontSize: "0.875rem",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            backgroundImage: "none",
            border: isDark ? "1px solid rgba(255, 255, 255, 0.07)" : "1px solid rgba(0, 0, 0, 0.07)",
            boxShadow: isDark
              ? "0 1px 3px rgba(0, 0, 0, 0.5)"
              : "0 1px 3px rgba(0, 0, 0, 0.05)",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            fontSize: "0.8125rem",
            padding: "10px 14px",
            borderColor: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)",
          },
          head: {
            fontWeight: 700,
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.03em",
            backgroundColor: isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
            color: isDark ? "#94a3b8" : "#64748b",
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            "&:hover": {
              backgroundColor: isDark
                ? "rgba(255, 255, 255, 0.03) !important"
                : "rgba(0, 0, 0, 0.02) !important",
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: 6,
          },
          sizeSmall: {
            fontSize: "0.7rem",
            height: 22,
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
