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
                    <Badge
                      badgeContent={tab.badge}
                      color="primary"
                      sx={{
                        "& .MuiBadge-badge": {
                          fontSize: "0.68rem",
                          height: 18,
                          minWidth: 18,
                          position: "static",
                          transform: "none",
                        },
                      }}
                    />
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
                    minHeight: 48,
                    fontSize: "0.8125rem",
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
