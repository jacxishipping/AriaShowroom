"use client";

import React from "react";
import Tabs, { TabsProps } from "@mui/material/Tabs";
import Tab, { TabProps } from "@mui/material/Tab";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";

export interface MuiTabItem {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactElement;
  badge?: React.ReactNode;
}

export interface MuiTabsProps extends Omit<TabsProps, "onChange" | "value"> {
  value: string;
  onChange: (value: string) => void;
  tabs?: MuiTabItem[];
  color?: "primary" | "secondary" | "gold";
  children?: React.ReactNode;
}

export function MuiTabs({
  value,
  onChange,
  tabs,
  color = "primary",
  children,
  className = "",
  ...props
}: MuiTabsProps) {
  const muiColor = color === "gold" ? "secondary" : color;

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    onChange(newValue);
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider", width: "100%" }} className={className}>
      <Tabs
        value={value}
        onChange={handleChange}
        textColor={muiColor as TabsProps["textColor"]}
        indicatorColor={muiColor as TabsProps["indicatorColor"]}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        {...props}
      >
        {tabs
          ? tabs.map((tab) => {
              const labelContent = (
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge !== null && (
                    <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono tabular-nums font-semibold rounded bg-stone-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {tab.badge}
                    </span>
                  )}
                </Box>
              );

              return (
                <Tab
                  key={tab.value}
                  value={tab.value}
                  label={labelContent}
                  icon={tab.icon}
                  iconPosition="start"
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    minHeight: 44,
                    fontSize: "0.78rem",
                    letterSpacing: "0.01em",
                  }}
                />
              );
            })
          : children}
      </Tabs>
    </Box>
  );
}

export { Tabs, Tab };
export default MuiTabs;
