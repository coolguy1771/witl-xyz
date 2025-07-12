import React from "react";
import { Grid as MuiGrid, GridProps as MuiGridProps } from "@mui/material";
import { Variants } from "framer-motion";

interface GridProps
  extends Omit<MuiGridProps, "xs" | "sm" | "md" | "lg" | "xl"> {
  size?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  variants?: Variants;
  component?: React.ElementType;
}

export const Grid: React.FC<GridProps> = ({
  size,
  // variants,
  // component,
  ...props
}) => {
  return (
    <MuiGrid
      {...props}
      size={{
        xs: size?.xs,
        sm: size?.sm,
        md: size?.md,
        lg: size?.lg,
        xl: size?.xl,
      }}
    />
  );
};
