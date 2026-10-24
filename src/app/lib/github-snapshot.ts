import type { Project } from "../types";
import { getCfEnv } from "./cloudflare";

// Written hourly by the cron in worker.ts; never served via /media.
export const PROJECTS_SNAPSHOT_KEY = "snapshots/github-projects.json";

function isProject(value: unknown): value is Project {
  if (typeof value !== "object" || value === null) return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p.title === "string" &&
    typeof p.description === "string" &&
    Array.isArray(p.tech) &&
    p.tech.every((entry) => typeof entry === "string") &&
    typeof p.link === "string" &&
    typeof p.stars === "number" &&
    typeof p.updatedAt === "string"
  );
}

/** Last known-good GitHub project list, or [] if none exists yet. */
export async function readProjectsSnapshot(): Promise<Project[]> {
  try {
    const object = await getCfEnv()?.MEDIA.get(PROJECTS_SNAPSHOT_KEY);
    if (!object) return [];

    const data: unknown = await object.json();
    return Array.isArray(data) ? data.filter(isProject) : [];
  } catch {
    return [];
  }
}
