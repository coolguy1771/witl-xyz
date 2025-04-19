"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Link,
  Chip,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import { getUserRepos } from "../lib/github-api";

// Sample GitHub response interface
interface GitHubRepo {
  id: number;
  name: string;
  html_url: string;
  description: string;
  topics: string[];
  language: string;
  stargazers_count: number;
  updated_at: string;
}

export default function GitHubProjects() {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // GitHub username to fetch repos from
  const username = "coolguy1771"; // Replace with your GitHub username

  useEffect(() => {
    async function fetchRepos() {
      try {
        setLoading(true);
        setError(null);

        // Use the Octokit-based function with options
        const data = await getUserRepos(username, {
          sort: "updated",
          per_page: 10, // Fetch a few extra to allow for filtering
          type: "owner",
        });

        // Get non-fork repos and limit to 6
        const filteredRepos = data.filter((repo) => !repo.fork).slice(0, 6);

        setRepos(filteredRepos);
        console.log("GitHub repos loaded successfully:", filteredRepos);
      } catch (err) {
        console.error("Error fetching GitHub repos:", err);
        setError("Failed to load GitHub projects. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchRepos();
  }, []);

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading GitHub projects...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (repos.length === 0) {
    return <Alert severity="info">No GitHub projects found.</Alert>;
  }

  return (
    <Grid container spacing={2}>
      {repos.map((repo) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={repo.id}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
              },
            }}
          >
            <CardContent
              sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
            >
              <Typography variant="h6" component="div" gutterBottom>
                <Link
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="none"
                >
                  {repo.name}
                </Link>
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2, flexGrow: 1 }}
              >
                {repo.description || "No description available"}
              </Typography>

              <Box sx={{ mt: "auto" }}>
                {repo.language && (
                  <Chip
                    label={repo.language}
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                )}

                {repo.topics &&
                  repo.topics
                    .slice(0, 3)
                    .map((topic) => (
                      <Chip
                        key={topic}
                        label={topic}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
