"use client";

import React from "react";
import { Fab, Zoom } from "@mui/material";
import { ArrowUp } from "lucide-react";

export interface ScrollToTopProps {
  show: boolean;
}

const ScrollToTop: React.FC<ScrollToTopProps> = ({ show }) => {
  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Zoom in={show}>
      <Fab
        color="primary"
        size="small"
        aria-label="scroll back to top"
        onClick={handleClick}
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: theme => theme.zIndex.drawer - 1,
        }}
      >
        <ArrowUp size={20} />
      </Fab>
    </Zoom>
  );
};

export default ScrollToTop;
