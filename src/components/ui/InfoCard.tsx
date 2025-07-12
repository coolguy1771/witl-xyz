"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  Alert,
  alpha,
  useTheme,
} from "@mui/material";
import type { InfoCardProps } from "../../types";

export const InfoCard: React.FC<InfoCardProps> = ({
  icon,
  title,
  children,
  noData = false,
}) => {
  const theme = useTheme();

  return (
    <Card
      elevation={2}
      sx={theme => ({
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        transition: theme.transitions.create(["transform", "box-shadow"], {
          duration: theme.transitions.duration.standard,
        }),
        height: "100%",
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: theme.shadows[4],
        },
        "&::before": noData
          ? {}
          : {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "3px",
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            },
      })}
    >
      <CardHeader
        avatar={
          <Box
            sx={theme => ({
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: noData
                ? alpha(theme.palette.warning.main, 0.1)
                : alpha(theme.palette.primary.main, 0.1),
              color: noData
                ? theme.palette.warning.main
                : theme.palette.primary.main,
            })}
          >
            {icon}
          </Box>
        }
        title={
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
            }}
          >
            {title}
          </Typography>
        }
        sx={{
          pb: 1,
          "& .MuiCardHeader-avatar": {
            marginRight: 2,
          },
        }}
      />
      <CardContent sx={{ pt: 0 }}>
        {noData ? (
          <Alert
            severity="warning"
            variant="outlined"
            sx={{
              backgroundColor: alpha(theme.palette.warning.main, 0.05),
            }}
          >
            {children}
          </Alert>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
};
