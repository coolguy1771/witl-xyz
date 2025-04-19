import { Metadata } from "next";
import { Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";
import SSLDashboard from "../components/ssl/SSLDashboard";

export const metadata: Metadata = {
  title: "SSL Certificate Tools | witl.xyz",
  description:
    "Check, analyze, and manage SSL certificates. Get detailed information about domain certificates, expiration dates, and security features.",
};

// Create a loading component for the Suspense fallback
function LoadingIndicator() {
  return (
    <Box
      component="section"
      sx={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress />
    </Box>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingIndicator />}>
      <SSLDashboard />
    </Suspense>
  );
}
