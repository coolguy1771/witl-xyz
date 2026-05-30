"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis, useLenis } from "lenis/react";

const NAVBAR_OFFSET = 72;

function LenisRouteSync() {
  const pathname = usePathname();
  const lenis = useLenis();

  useEffect(() => {
    if (window.location.hash) {
      return;
    }

    lenis?.scrollTo(0, { immediate: true });
  }, [pathname, lenis]);

  return null;
}

export function SmoothScroll() {
  return (
    <>
      <ReactLenis
        root
        options={{
          autoRaf: true,
          stopInertiaOnNavigate: true,
          allowNestedScroll: true,
          anchors: {
            offset: NAVBAR_OFFSET,
          },
        }}
      />
      <LenisRouteSync />
    </>
  );
}
