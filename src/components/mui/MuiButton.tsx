"use client";

import React from "react";
import Button, { ButtonProps } from "@mui/material/Button";

export interface MuiButtonProps extends Omit<ButtonProps, "color"> {
  color?: "primary" | "secondary" | "success" | "error" | "warning" | "info" | "inherit" | "gold";
  target?: string;
  rel?: string;
  component?: any;
  [key: string]: any;
}

export const MuiButton = React.forwardRef<HTMLButtonElement, MuiButtonProps>(function MuiButton(
  { color = "primary", variant = "contained", ...props },
  ref
) {
  // Map non-standard gold to official warning palette
  const muiColor = color === "gold" ? "warning" : color;

  return (
    <Button
      ref={ref}
      variant={variant}
      color={muiColor as ButtonProps["color"]}
      {...props}
    />
  );
});

export { Button };
export default MuiButton;
