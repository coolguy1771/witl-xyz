"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const SystemdBootScreen = dynamic(
  () => import("./SystemdBootScreen").then((module) => module.SystemdBootScreen),
  { ssr: false },
);

export function BootScreenGate() {
  const pathname = usePathname();

  if (pathname !== "/") {
    return null;
  }

  return <SystemdBootScreen />;
}
