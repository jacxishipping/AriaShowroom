"use client";

import React from "react";
import Paper, { PaperProps } from "@mui/material/Paper";

export type MuiPaperProps = PaperProps;

export const MuiPaper = React.forwardRef<HTMLDivElement, MuiPaperProps>(function MuiPaper(
  { elevation = 1, variant = "elevation", ...props },
  ref
) {
  return <Paper ref={ref} elevation={elevation} variant={variant} {...props} />;
});

export { Paper };
export default MuiPaper;
