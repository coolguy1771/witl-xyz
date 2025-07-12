"use client";

import React from "react";
import { motion } from "framer-motion";
import Chip from "@mui/material/Chip";

interface TechBadgeProps {
  tech: string;
  index: number;
}

export const TechBadge: React.FC<TechBadgeProps> = ({ tech, index }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ scale: 1.05 }}
  >
    <Chip
      label={tech}
      size="small"
      sx={{
        backgroundColor: theme => theme.palette.background.paper,
        color: theme => theme.palette.text.secondary,
        border: theme => `1px solid ${theme.palette.divider}`,
        "&:hover": {
          backgroundColor: theme => theme.palette.action.hover,
        },
      }}
    />
  </motion.div>
);
