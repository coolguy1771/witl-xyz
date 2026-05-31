export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NODE_ENV === "production" ? "https://witl.xyz" : "http://localhost:3000");

export const SITE_NAME = "Tyler Witlin";
export const SITE_TITLE = "Tyler Witlin - DevOps Engineer";
export const SITE_DESCRIPTION =
  "DevOps Engineer specializing in Kubernetes, GitOps, CI/CD pipelines, and cloud-native infrastructure. CKA certified.";

export const SITE_EMAIL = "twitlin@witl.xyz";
export const GITHUB_USERNAME = "coolguy1771";
