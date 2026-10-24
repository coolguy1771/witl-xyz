import type { Project } from "../types";
import { getCfEnv } from "./cloudflare";

// Written hourly by the cron in worker.ts; never served via /media.
export const PROJECTS_SNAPSHOT_KEY = "snapshots/github-projects.json";

/** Last known-good GitHub project list, or [] if none exists yet. */
export async function readProjectsSnapshot(): Promise<Project[]> {
  try {
    const object = await getCfEnv()?.MEDIA.get(PROJECTS_SNAPSHOT_KEY);
    if (!object) return [];

    const data: unknown = await object.json();
    return Array.isArray(data) ? (data as Project[]) : [];
  } catch {
    return [];
  }
}
