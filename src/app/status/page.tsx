import type { Metadata } from "next";
import { StatusDashboard } from "./StatusDashboard";

export const metadata: Metadata = {
  title: "System Status | witl.xyz",
  description: "Live operational status for witl.xyz and dependent services.",
};

export default function StatusPage() {
  return <StatusDashboard />;
}
