import { headers } from "next/headers";
import { Metadata } from "next";
import { Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";
import VisitorDashboard from "../components/VisitorDashboard";

export const metadata: Metadata = {
  title: "Your Digital Profile | witl.xyz",
  description: "View real-time information about your connection, location, and device.",
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

export default async function Page() {
  const headersList = await headers();

  // Get basic data from Cloudflare headers for initial load
  // The full set of data will be fetched from the client via the API
  const visitorData = {
    ip: headersList.get("cf-connecting-ip"),
    city: headersList.get("cf-ipcity"),
    country: headersList.get("cf-ipcountry"),
    countryName: headersList.get("cf-ipcountry-name"),
    latitude: headersList.get("cf-iplatitude"),
    longitude: headersList.get("cf-iplongitude"),
    region: headersList.get("cf-region"),
    timezone: headersList.get("cf-timezone"),
  };

  return (
    <Suspense fallback={<LoadingIndicator />}>
      <VisitorDashboard initialData={visitorData} />
    </Suspense>
  );
}
