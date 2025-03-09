"use client";
import React from "react";
import { CircularProgress, Fade } from "@mui/material";

export const Loading: React.FC = () => (
  <Fade in={true} timeout={750}>
    <div className="flex items-center justify-center h-64">
      <CircularProgress />
    </div>
  </Fade>
);
