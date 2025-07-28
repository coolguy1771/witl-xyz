"use client";

import React from "react";
import { Box, Container, Skeleton, Card, CardContent, Grid } from "@mui/material";

export function BlogListSkeleton() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 6, textAlign: "center" }}>
        <Skeleton variant="text" width="60%" height={60} sx={{ mx: "auto" }} />
        <Skeleton variant="text" width="40%" height={30} sx={{ mx: "auto", mt: 2 }} />
      </Box>

      <Box sx={{ mb: 4 }}>
        <Skeleton variant="text" width="150px" height={30} />
        <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="rounded" width={80} height={32} />
          ))}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={i}>
            <Card
              sx={{
                height: "100%",
                backgroundColor: "oklch(var(--uchu-yin-8-raw))",
                borderColor: "oklch(var(--uchu-yin-7-raw))",
                borderWidth: 1,
                borderStyle: "solid",
              }}
            >
              <Skeleton variant="rectangular" height={200} />
              <CardContent>
                <Skeleton variant="text" height={40} />
                <Skeleton variant="text" height={20} width="60%" sx={{ mt: 2 }} />
                <Skeleton variant="text" height={100} sx={{ mt: 2 }} />
                <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                  <Skeleton variant="rounded" width={60} height={24} />
                  <Skeleton variant="rounded" width={80} height={24} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
