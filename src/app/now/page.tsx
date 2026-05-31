import type { ReactNode } from "react";
import { Container, Typography, Box, Link as MuiLink } from "@mui/material";
import { format } from "date-fns";
import { getNowPage } from "../lib/fs-now";
import { SITE_NAME, SITE_URL } from "../lib/site";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getNowPage();

  return {
    title: `${page.title} | ${SITE_NAME}`,
    description: `What ${SITE_NAME} is focused on right now.`,
    alternates: {
      canonical: `${SITE_URL}/now`,
    },
  };
}

function renderInlineMarkdown(text: string): ReactNode {
  const linkMatch = text.match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/);
  if (!linkMatch) {
    return text;
  }

  const [full, label, href] = linkMatch;
  const [before, after] = text.split(full);

  return (
    <>
      {before}
      <MuiLink href={href} target="_blank" rel="noopener noreferrer">
        {label}
      </MuiLink>
      {after}
    </>
  );
}

export default async function NowPage() {
  const page = await getNowPage();
  const updatedLabel = format(new Date(page.updated), "MMMM d, yyyy");

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        pt: { xs: 12, md: 14 },
        pb: { xs: 8, md: 12 },
        px: { xs: 2, sm: 4 },
      }}
    >
      <Container maxWidth="md">
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
          {page.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Last updated {updatedLabel}
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {page.sections.map((section) => (
            <Box key={section.heading}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
                {section.heading}
              </Typography>
              {section.paragraphs.map((paragraph) => (
                <Typography
                  key={paragraph}
                  variant="body1"
                  color="text.secondary"
                  sx={{ lineHeight: 1.75, mb: 1.5 }}
                >
                  {renderInlineMarkdown(paragraph)}
                </Typography>
              ))}
            </Box>
          ))}
        </Box>

        {page.footer && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 6, lineHeight: 1.75 }}>
            {renderInlineMarkdown(page.footer)}
          </Typography>
        )}
      </Container>
    </Box>
  );
}
