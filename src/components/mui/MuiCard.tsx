"use client";

import React from "react";
import Card, { CardProps } from "@mui/material/Card";
import CardHeader, { CardHeaderProps } from "@mui/material/CardHeader";
import CardContent, { CardContentProps } from "@mui/material/CardContent";
import CardActions, { CardActionsProps } from "@mui/material/CardActions";

export type MuiCardProps = CardProps;

export const MuiCard = React.forwardRef<HTMLDivElement, MuiCardProps>(function MuiCard(
  { elevation = 1, variant = "elevation", ...props },
  ref
) {
  return <Card ref={ref} elevation={elevation} variant={variant} {...props} />;
});

export const MuiCardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(function MuiCardHeader(
  props,
  ref
) {
  return <CardHeader ref={ref} {...props} />;
});

export const MuiCardContent = React.forwardRef<HTMLDivElement, CardContentProps>(function MuiCardContent(
  props,
  ref
) {
  return <CardContent ref={ref} {...props} />;
});

export const MuiCardActions = React.forwardRef<HTMLDivElement, CardActionsProps>(function MuiCardActions(
  props,
  ref
) {
  return <CardActions ref={ref} {...props} />;
});

export { Card, CardHeader, CardContent, CardActions };
export default MuiCard;
