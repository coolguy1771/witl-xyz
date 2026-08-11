import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  fetchGithubProjectBySlug,
  type GithubProjectDetail,
} from "@/app/lib/github";
import { Box, Container, Typography, Button, Chip, Stack, Paper } from "@mui/material";
import { Star, GitFork, Calendar, Code2, ExternalLink, ArrowLeft, Tag, Bug } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  // Use dynamic for now to allow any valid slug without build-time pregeneration
  return [];
}

export const dynamic = "force-dynamic";

export async function generateMetadata(props: Props): Promise<Metadata> {
  try {
    const params = await props.params;
    const slug = params?.slug;
    if (!slug) return {};

    const project = await fetchGithubProjectBySlug(slug);
    if (!project) return {};

    const description =
      `${project.description}` || `GitHub repository: ${project.full_name}`;

    return {
      title: `${project.name} - Tyler Witlin`,
      description,
      keywords: [...project.topics, project.language].filter(
        (value): value is string => Boolean(value),
      ),
      openGraph: {
        title: `${project.name} - Project Detail`,
        description,
        type: "website",
        siteName: "Tyler Witlin",
        url: `https://witl.xyz/projects/${slug}`,
      },
      twitter: {
        card: "summary_large_image",
        title: `${project.name} - Tyler Witlin`,
        description,
      },
    };
  } catch (error) {
    console.error("Error generating metadata for project:", error);
    return {};
  }
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default async function ProjectDetailPage(props: Props) {
  const params = await props.params;
  const slug = params?.slug;
  if (!slug) notFound();

  const project = await fetchGithubProjectBySlug(slug);
  if (!project) notFound();

  return (
    <Box sx={{ minHeight: "calc(100vh - 180px)", py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        {/* Breadcrumb / Back button */}
        <Box sx={{ mb: 4 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <Button
              startIcon={<ArrowLeft size={16} />}
              sx={{
                color: (t) => t.palette.text.secondary,
                textTransform: "none",
                fontSize: "0.9rem",
              }}
            >
              Back to Home
            </Button>
          </Link>
        </Box>

        {/* Header Card */}
        <Paper
          elevation={2}
          sx={{
            p: { xs: 3, md: 5 },
            mb: 4,
            borderRadius: 2,
            border: (t) => `1px solid ${t.palette.divider}`,
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "3px",
              background: (t) => `linear-gradient(90deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
            },
          }}
        >
          {/* Title row */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap", mb: 2 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "1.5rem", sm: "2rem" },
                  mb: 1,
                }}
              >
                {project.name}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "'Geist Mono', monospace" }}>
                {project.full_name}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
              <Button
                component="a"
                href={project.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<FaGithub size={18} />}
                variant="outlined"
                size="medium"
                sx={{ borderRadius: 2 }}
              >
                View on GitHub
              </Button>

              {project.homepage && (
                <Button
                  component="a"
                  href={project.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<ExternalLink size={18} />}
                  variant="outlined"
                  size="medium"
                  sx={{ borderRadius: 2 }}
                >
                  Live Site
                </Button>
              )}
            </Stack>
          </Box>

          {/* Description */}
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3, lineHeight: 1.6 }}
          >
            {project.description}
          </Typography>

          {/* Stats row */}
          <Stack
            direction="row"
            spacing={2}
            sx={{ mb: 3, flexWrap: "wrap", alignItems: "center" }}
          >
            <StatPill icon={<Star size={14} />} label={`${formatNumber(project.stars)} stars`} />
            <StatPill icon={<GitFork size={14} />} label={`${formatNumber(project.forks)} forks`} />
            <StatPill icon={<Bug size={14} />} label={`${project.openIssues} open issues`} />

            {project.language && (
              <Chip
                icon={<Code2 size={14} />}
                label={project.language}
                size="small"
                sx={{
                  height: 28,
                  backgroundColor: (t) => t.palette.primary.main + "15",
                  color: (t) => t.palette.primary.main,
                  border: (t) => `1px solid ${t.palette.primary.main}30`,
                }}
              />
            )}

            {project.license && (
              <Chip label={project.license} size="small" sx={{ height: 28, fontSize: "0.7rem" }} />
            )}

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary", fontSize: "0.75rem" }}>
              <Calendar size={14} />
              Updated {formatDistanceToNow(new Date(project.lastUpdated), { addSuffix: true })}
            </Box>
          </Stack>

          {/* Topics */}
          {project.topics.length > 0 && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
                color: "text.secondary",
              }}
            >
              <Tag size={14} />
              <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap" }}>
                {project.topics.map((topic) => (
                  <Chip
                    key={topic}
                    label={`#${topic}`}
                    size="small"
                    sx={{
                      height: 24,
                      fontSize: "0.7rem",
                      backgroundColor: (t) => t.palette.secondary.main + "10",
                      color: (t) => t.palette.secondary.main,
                      border: (t) => `1px solid ${t.palette.secondary.main}30`,
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* Fork / Archived badges */}
          <Box sx={{ mt: 2 }}>
            {project.isFork && (
              <Chip label="Fork" size="small" color="default" sx={{ mr: 1 }} />
            )}
            {project.isArchived && (
              <Chip label="Archived" size="small" color="error" />
            )}
          </Box>
        </Paper>

        {/* README Section */}
        {project.readmeHtml ? (
          <ReadmeSection project={project} />
        ) : (
          <Paper
            elevation={1}
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: 2,
              border: (t) => `1px solid ${t.palette.divider}`,
            }}
          >
            <Typography color="text.secondary">
              No README available for this repository.
            </Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
}

function StatPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        color: "text.secondary",
        fontSize: "0.78rem",
      }}
    >
      {icon}
      {label}
    </Box>
  );
}

function ReadmeSection({
  project,
}: {
  project: GithubProjectDetail & { readmeHtml: string };
}) {
  return (
    <Paper
      elevation={1}
      sx={{
        borderRadius: 2,
        border: (t) => `1px solid ${t.palette.divider}`,
        overflow: "hidden",
      }}
    >
      {/* README header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
          backgroundColor: (t) => t.palette.background.paper,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box component="span" sx={{ display: "inline-flex", color: "primary.main" }}>
          <Code2 size={16} />
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          README
        </Typography>
      </Box>

      {/* Rendered markdown — styled to look like GitHub readme */}
      <Box
        sx={{
          p: { xs: 2, md: 4 },
          "& h1, & h2, & h3, & h4": {
            fontWeight: 600,
            mt: 3,
            mb: 1.5,
          },
          "& code": {
            fontFamily: "'Fira Code', monospace",
            backgroundColor: (t) => t.palette.mode === "dark" ? "#1e1e2e" : "#f0f0f0",
            padding: "0.15em 0.35em",
            borderRadius: "4px",
            fontSize: "0.875em",
          },
          "& pre": {
            backgroundColor: (t) => t.palette.mode === "dark" ? "#0d1117" : "#f6f8fa",
            padding: 2,
            borderRadius: 8,
            overflow: "auto",
            marginBottom: 2,
          },
          "& pre code": {
            backgroundColor: "transparent",
            padding: 0,
          },
          "& a": {
            color: (t) => t.palette.primary.main,
          },
          "& blockquote": {
            borderLeft: (t) => `4px solid ${t.palette.divider}`,
            paddingLeft: 2,
            margin: "1em 0",
            color: "text.secondary",
          },
          "& img": {
            maxWidth: "100%",
            height: "auto",
            borderRadius: 8,
          },
        }}
        dangerouslySetInnerHTML={{ __html: project.readmeHtml || "" }}
      />
    </Paper>
  );
}
