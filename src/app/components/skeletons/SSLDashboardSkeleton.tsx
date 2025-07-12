import React from "react";
import {
  Box,
  Container,
  Skeleton,
  Grid,
  Card,
  CardContent,
} from "@mui/material";

export const SSLDashboardSkeleton: React.FC = () => {
  return (
    <Box component="section" sx={{ py: 8 }}>
      <Container maxWidth="lg">
        {/* Dashboard title skeleton */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Skeleton
            variant="text"
            width="400px"
            height={60}
            sx={{ mx: "auto", mb: 2 }}
          />
          <Skeleton
            variant="text"
            width="600px"
            height={30}
            sx={{ mx: "auto" }}
          />
        </Box>

        {/* Domain input skeleton */}
        <Box sx={{ mb: 6, display: "flex", justifyContent: "center" }}>
          <Box sx={{ display: "flex", gap: 2, width: "100%", maxWidth: 500 }}>
            <Skeleton variant="rounded" height={56} sx={{ flex: 1 }} />
            <Skeleton variant="rounded" width={120} height={56} />
          </Box>
        </Box>

        {/* SSL certificates grid skeleton */}
        <Grid container spacing={4}>
          {[...Array(4)].map((_, index) => (
            <Grid size={{ xs: 12, md: 6 }} key={index}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ p: 3 }}>
                  {/* Certificate domain */}
                  <Skeleton
                    variant="text"
                    width="70%"
                    height={28}
                    sx={{ mb: 2 }}
                  />

                  {/* Certificate details */}
                  <Box sx={{ mb: 2 }}>
                    <Skeleton
                      variant="text"
                      width="100%"
                      height={20}
                      sx={{ mb: 1 }}
                    />
                    <Skeleton
                      variant="text"
                      width="80%"
                      height={20}
                      sx={{ mb: 1 }}
                    />
                    <Skeleton
                      variant="text"
                      width="90%"
                      height={20}
                      sx={{ mb: 1 }}
                    />
                  </Box>

                  {/* Status indicator */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Skeleton variant="circular" width={12} height={12} />
                    <Skeleton variant="text" width={100} height={20} />
                  </Box>

                  {/* Expiry info */}
                  <Skeleton
                    variant="text"
                    width="60%"
                    height={20}
                    sx={{ mb: 2 }}
                  />

                  {/* Action button */}
                  <Skeleton variant="rounded" width="100%" height={36} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
