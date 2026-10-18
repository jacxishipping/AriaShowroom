"use client";

import React from "react";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";

export type MuiTextFieldProps = TextFieldProps & {
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  sizeVariant?: "small" | "medium";
};

export const MuiTextField = React.forwardRef<HTMLDivElement, MuiTextFieldProps>(
  function MuiTextField(
    {
      startAdornment,
      endAdornment,
      sizeVariant = "small",
      size,
      variant = "outlined",
      slotProps,
      fullWidth = true,
      ...props
    },
    ref
  ) {
    const existingInputSlotProps =
      typeof slotProps?.input === "function" ? {} : (slotProps?.input as Record<string, any>) || {};

    const mergedSlotProps = {
      ...slotProps,
      input: {
        ...existingInputSlotProps,
        ...(startAdornment && {
          startAdornment: (
            <InputAdornment position="start">{startAdornment}</InputAdornment>
          ),
        }),
        ...(endAdornment && {
          endAdornment: (
            <InputAdornment position="end">{endAdornment}</InputAdornment>
          ),
        }),
      },
    };

    return (
      <TextField
        ref={ref}
        variant={variant as any}
        size={size || sizeVariant}
        fullWidth={fullWidth}
        slotProps={mergedSlotProps as any}
        {...props}
      />
    );
  }
);

export { TextField, InputAdornment };
export default MuiTextField;
