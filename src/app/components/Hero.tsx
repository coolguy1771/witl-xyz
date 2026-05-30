"use client";

import React, { useEffect, useState } from "react";
import { Button, Container, Box, Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { fadeIn, popIn } from "../lib/animations";
import { MotionBox } from "./motion-ui";

const TERMINAL_LINES = [
  { type: "prompt", text: "whoami" },
  { type: "output", text: "Tyler Witlin" },
  { type: "blank", text: "" },
  { type: "prompt", text: "cat role.txt" },
  { type: "output-highlight", text: "DevOps Engineer @ Cisco Systems" },
  { type: "blank", text: "" },
  { type: "prompt", text: "kubectl get specialties --no-headers" },
  { type: "output-green", text: "openshift    argocd    helm    golang    air-gapped" },
  { type: "blank", text: "" },
  { type: "prompt", text: "git log --oneline -1" },
  { type: "output", text: "built ci/cd on openshift for a lot of engineers" },
];

const CHAR_DELAY = 35;
const LINE_PAUSE = 180;

export const HeroSection: React.FC = () => {
  const theme = useTheme();
  const [visibleLines, setVisibleLines] = useState<{ type: string; text: string }[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (currentLineIndex >= TERMINAL_LINES.length) {
      setDone(true);
      return;
    }

    const line = TERMINAL_LINES[currentLineIndex];

    if (line.type === "blank") {
      const timer = setTimeout(() => {
        setVisibleLines((prev) => [...prev, line]);
        setCurrentLineIndex((i) => i + 1);
        setCurrentCharIndex(0);
      }, LINE_PAUSE);
      return () => clearTimeout(timer);
    }

    if (currentCharIndex < line.text.length) {
      const delay = line.type === "prompt" ? CHAR_DELAY : CHAR_DELAY * 0.7;
      const timer = setTimeout(() => {
        setCurrentCharIndex((i) => i + 1);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setVisibleLines((prev) => [...prev, { ...line, text: line.text }]);
        setCurrentLineIndex((i) => i + 1);
        setCurrentCharIndex(0);
      }, LINE_PAUSE);
      return () => clearTimeout(timer);
    }
  }, [currentLineIndex, currentCharIndex]);

  const isDark = theme.palette.mode === "dark";
  const terminalBg = isDark ? "#0d1117" : "#1a1f2e";
  const terminalBorder = isDark ? "#1e293b" : "#2d3748";
  const terminalHeader = isDark ? "#141c27" : "#252d3d";

  const currentLine =
    currentLineIndex < TERMINAL_LINES.length ? TERMINAL_LINES[currentLineIndex] : null;
  const partialText = currentLine ? currentLine.text.slice(0, currentCharIndex) : "";

  const getLineColor = (type: string) => {
    switch (type) {
      case "output-highlight":
        return "#00d4ff";
      case "output-green":
        return "#3dd68c";
      case "output":
        return "#94a3b8";
      default:
        return "#e2e8f0";
    }
  };

  return (
    <Box
      component="section"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pt: 8,
        pb: 10,
        position: "relative",
        backgroundColor: theme.palette.background.default,
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "100%",
          background: isDark
            ? "radial-gradient(ellipse at 20% 50%, rgba(0, 212, 255, 0.04) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(61, 214, 140, 0.04) 0%, transparent 50%)"
            : "radial-gradient(ellipse at 20% 50%, rgba(0, 119, 170, 0.05) 0%, transparent 50%)",
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Stack spacing={4} sx={{ alignItems: "flex-start" }}>
          {/* Terminal window */}
          <MotionBox
            variants={fadeIn}
            initial="initial"
            animate="animate"
            sx={{
              width: "100%",
              maxWidth: "720px",
              borderRadius: "8px",
              border: `1px solid ${terminalBorder}`,
              backgroundColor: terminalBg,
              boxShadow: isDark
                ? "0 20px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0, 212, 255, 0.05)"
                : "0 20px 60px rgba(0, 0, 0, 0.4)",
              overflow: "hidden",
              fontFamily: "'Geist Mono', monospace",
            }}
          >
            {/* Terminal title bar */}
            <Box
              sx={{
                backgroundColor: terminalHeader,
                px: 2,
                py: 1.25,
                display: "flex",
                alignItems: "center",
                gap: 1,
                borderBottom: `1px solid ${terminalBorder}`,
              }}
            >
              <Box sx={{ display: "flex", gap: 0.75 }}>
                <Box className="terminal-dot-red" sx={{ width: 12, height: 12, borderRadius: "50%" }} />
                <Box className="terminal-dot-yellow" sx={{ width: 12, height: 12, borderRadius: "50%" }} />
                <Box className="terminal-dot-green" sx={{ width: 12, height: 12, borderRadius: "50%" }} />
              </Box>
              <Box
                sx={{
                  flex: 1,
                  textAlign: "center",
                  fontSize: "0.75rem",
                  color: "#64748b",
                  fontFamily: "'Geist Mono', monospace",
                  letterSpacing: "0.02em",
                }}
              >
                tyler@witl.xyz — bash
              </Box>
            </Box>

            {/* Terminal body */}
            <Box sx={{ p: { xs: 2, sm: 3 }, minHeight: "320px" }}>
              {/* Completed lines */}
              {visibleLines.map((line, idx) => (
                <Box key={idx} sx={{ mb: 0.5, lineHeight: 1.6 }}>
                  {line.type === "blank" ? (
                    <Box sx={{ height: "1.2em" }} />
                  ) : line.type === "prompt" ? (
                    <Box sx={{ display: "flex", gap: 1, alignItems: "baseline" }}>
                      <Box
                        component="span"
                        sx={{ color: "#3dd68c", fontWeight: 600, userSelect: "none" }}
                      >
                        $
                      </Box>
                      <Box component="span" sx={{ color: "#e2e8f0", fontSize: { xs: "0.85rem", sm: "0.95rem" } }}>
                        {line.text}
                      </Box>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        pl: 2,
                        color: getLineColor(line.type),
                        fontSize: { xs: "0.85rem", sm: "0.95rem" },
                        fontWeight: line.type === "output-highlight" ? 600 : 400,
                      }}
                    >
                      {line.text}
                    </Box>
                  )}
                </Box>
              ))}

              {/* Currently typing line */}
              {!done && currentLine && currentLine.type !== "blank" && (
                <Box sx={{ mb: 0.5, lineHeight: 1.6 }}>
                  {currentLine.type === "prompt" ? (
                    <Box sx={{ display: "flex", gap: 1, alignItems: "baseline" }}>
                      <Box
                        component="span"
                        sx={{ color: "#3dd68c", fontWeight: 600, userSelect: "none" }}
                      >
                        $
                      </Box>
                      <Box component="span" sx={{ color: "#e2e8f0", fontSize: { xs: "0.85rem", sm: "0.95rem" } }}>
                        {partialText}
                        <span className="terminal-cursor" />
                      </Box>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        pl: 2,
                        color: getLineColor(currentLine.type),
                        fontSize: { xs: "0.85rem", sm: "0.95rem" },
                      }}
                    >
                      {partialText}
                      <span className="terminal-cursor" />
                    </Box>
                  )}
                </Box>
              )}

              {/* Idle cursor after done */}
              {done && (
                <Box sx={{ display: "flex", gap: 1, alignItems: "baseline", mt: 0.5 }}>
                  <Box component="span" sx={{ color: "#3dd68c", fontWeight: 600, userSelect: "none" }}>
                    $
                  </Box>
                  <span className="terminal-cursor" />
                </Box>
              )}
            </Box>
          </MotionBox>

          {/* CTA buttons */}
          <MotionBox variants={popIn} initial="initial" animate="animate">
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button
                href="#projects"
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: isDark ? "#0a0e14" : "#ffffff",
                  fontWeight: 600,
                  py: 1.25,
                  px: 3.5,
                  fontSize: "0.95rem",
                  fontFamily: "'Geist Mono', monospace",
                  borderRadius: "4px",
                  border: `1px solid ${theme.palette.primary.main}`,
                  boxShadow: isDark
                    ? "0 0 20px rgba(0, 212, 255, 0.15)"
                    : "0 4px 12px rgba(0, 119, 170, 0.2)",
                  "&:hover": {
                    backgroundColor: theme.palette.primary.light,
                    boxShadow: isDark
                      ? "0 0 30px rgba(0, 212, 255, 0.3)"
                      : "0 6px 20px rgba(0, 119, 170, 0.3)",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                ./view-work
              </Button>
              <Button
                href="#contact"
                variant="outlined"
                size="large"
                sx={{
                  color: theme.palette.secondary.main,
                  fontWeight: 600,
                  py: 1.25,
                  px: 3.5,
                  fontSize: "0.95rem",
                  fontFamily: "'Geist Mono', monospace",
                  borderRadius: "4px",
                  borderColor: theme.palette.secondary.main,
                  "&:hover": {
                    borderColor: theme.palette.secondary.light,
                    color: theme.palette.secondary.light,
                    backgroundColor: isDark
                      ? "rgba(61, 214, 140, 0.05)"
                      : "rgba(45, 140, 96, 0.05)",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                ./contact
              </Button>
            </Stack>
          </MotionBox>
        </Stack>
      </Container>
    </Box>
  );
};
