"use client";

import { usePathname } from "next/navigation";
import { SystemdBootScreen } from "./SystemdBootScreen";

export function BootScreenGate() {
  const pathname = usePathname();

  if (pathname !== "/") {
    return null;
  }

  return <SystemdBootScreen />;
}
