"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const routes: Record<string, string> = {
  "1": "/dashboard",
  "2": "/opportunity-intelligence",
  "3": "/decision-engine",
  "4": "/capital-allocation",
  "5": "/execution-war-room",
  "6": "/validation-lab",
  "7": "/moat-builder",
  "8": "/founder-performance",
  "9": "/idea-comparison",
};

export function KeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!event.altKey) {
        return;
      }

      const targetRoute = routes[event.key];
      if (targetRoute) {
        event.preventDefault();
        router.push(targetRoute);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router]);

  return null;
}
