"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Chip,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";
import { RefreshCw } from "lucide-react";
import type { StatusReport, ServiceStatus } from "@/app/lib/status-types";

const STATUS_LABELS: Record<ServiceStatus, string> = {
  operational: "Operational",
  degraded: "Degraded",
  down: "Down",
};

const STATUS_COLORS: Record<ServiceStatus, "success" | "warning" | "error"> = {
  operational: "success",
  degraded: "warning",
  down: "error",
};

export function StatusDashboard() {
  const theme = useTheme();
  const [report, setReport] = useState<StatusReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/status", {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      const data = (await response.json()) as StatusReport;
      setReport(data);
    } catch {
      setError("Unable to load status data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
    const interval = window.setInterval(loadStatus, 60_000);
    return () => window.clearInterval(interval);
  }, [loadStatus]);

  return (
    <Box
      component="section"
      sx={{
        minHeight: "100vh",
        py: { xs: 8, md: 12 },
        px: { xs: 2, sm: 4 },
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 1,
              fontFamily: "'Geist Mono', monospace",
            }}
          >
            System Status
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Live health checks for witl.xyz and its dependencies.
          </Typography>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
            {report && (
              <Chip
                label={STATUS_LABELS[report.status]}
                color={STATUS_COLORS[report.status]}
                size="small"
              />
            )}
            <Chip
              icon={<RefreshCw size={14} />}
              label={loading ? "Refreshing..." : "Refresh"}
              onClick={loadStatus}
              variant="outlined"
              size="small"
              disabled={loading}
            />
            <Typography variant="caption" color="text.secondary">
              Auto-refreshes every 60s
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper
          elevation={2}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Service</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Latency</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(report?.checks ?? []).map((check) => (
                <TableRow key={check.name}>
                  <TableCell sx={{ fontFamily: "'Geist Mono', monospace" }}>
                    {check.name}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={STATUS_LABELS[check.status]}
                      color={STATUS_COLORS[check.status]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">{check.latencyMs} ms</TableCell>
                  <TableCell>{check.message}</TableCell>
                </TableRow>
              ))}
              {!report?.checks.length && loading && (
                <TableRow>
                  <TableCell colSpan={4}>Loading checks...</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>

        {report?.checkedAt && (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
            Last checked: {new Date(report.checkedAt).toLocaleString()}
          </Typography>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
          JSON feed:{" "}
          <Link href="/api/status" style={{ color: theme.palette.primary.main }}>
            /api/status
          </Link>
        </Typography>
      </Container>
    </Box>
  );
}
