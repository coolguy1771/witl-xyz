"use client";

import { motion } from "framer-motion";
import { AppBar, Box, Container, Paper, Typography } from "@mui/material";

// MUI v9 requires motion.create() to properly type Framer Motion + MUI combos.
// Using component={motion.x} no longer works with MUI v9's strict type overloads.
export const MotionBox = motion.create(Box);
export const MotionTypography = motion.create(Typography);
export const MotionContainer = motion.create(Container);
export const MotionAppBar = motion.create(AppBar);
export const MotionPaper = motion.create(Paper);
