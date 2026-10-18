"use client";

import React from "react";
import Chip, { ChipProps } from "@mui/material/Chip";

export interface MuiChipProps extends Omit<ChipProps, "color"> {
  color?: "default" | "primary" | "secondary" | "gold" | "success" | "warning" | "error" | "info";
}

export const MuiChip = React.forwardRef<HTMLDivElement, MuiChipProps>(function MuiChip(
  { color = "default", size = "small", variant = "filled", ...props },
  ref
) {
  const muiColor = color === "gold" ? "warning" : color;

  return (
    <Chip
      ref={ref}
      color={muiColor as ChipProps["color"]}
      size={size}
      variant={variant}
      {...props}
    />
  );
});

export { Chip };
export default MuiChip;
