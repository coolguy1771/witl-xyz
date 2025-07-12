import React from "react";
import {
  Box,
  Container,
  Skeleton,
  Grid,
  Card,
  CardContent,
} from "@mui/material";

export const ProjectsSkeleton: React.FC = () => {
  return (
    <Box component="section" sx={{ py: 8 }}>
      <Container maxWidth="lg">
        {/* Section title skeleton */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Skeleton
            variant="text"
            width="300px"
            height={60}
            sx={{ mx: "auto", mb: 2 }}
          />
          <Skeleton
            variant="text"
            width="500px"
            height={30}
            sx={{ mx: "auto" }}
          />
        </Box>

        {/* Projects grid skeleton */}
        <Grid container spacing={4}>
          {[...Array(6)].map((_, index) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={index}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ p: 3 }}>
                  {/* Project title */}
                  <Skeleton
                    variant="text"
                    width="80%"
                    height={32}
                    sx={{ mb: 1 }}
                  />

                  {/* Project description */}
                  <Skeleton
                    variant="text"
                    width="100%"
                    height={20}
                    sx={{ mb: 0.5 }}
                  />
                  <Skeleton
                    variant="text"
                    width="90%"
                    height={20}
                    sx={{ mb: 0.5 }}
                  />
                  <Skeleton
                    variant="text"
                    width="70%"
                    height={20}
                    sx={{ mb: 2 }}
                  />

                  {/* Tech stack chips */}
                  <Box
                    sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}
                  >
                    {[...Array(3)].map((_, chipIndex) => (
                      <Skeleton
                        key={chipIndex}
                        variant="rounded"
                        width={60}
                        height={24}
                      />
                    ))}
                  </Box>

                  {/* Stats */}
                  <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <Skeleton variant="text" width={80} height={20} />
                    <Skeleton variant="text" width={60} height={20} />
                  </Box>

                  {/* Action buttons */}
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Skeleton variant="rounded" width={100} height={36} />
                    <Skeleton variant="rounded" width={80} height={36} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
