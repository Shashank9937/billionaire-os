"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems: Array<{ href: Route; label: string; key?: string }> = [
  { href: "/dashboard", label: "Command Center", key: "Alt+1" },
  { href: "/opportunity-intelligence", label: "Opportunity Engine", key: "Alt+2" },
  { href: "/decision-engine", label: "Decision Engine", key: "Alt+3" },
  { href: "/capital-allocation", label: "Capital Allocation", key: "Alt+4" },
  { href: "/execution-war-room", label: "Execution War Room", key: "Alt+5" },
  { href: "/validation-lab", label: "Validation Lab", key: "Alt+6" },
  { href: "/moat-builder", label: "Moat Builder", key: "Alt+7" },
  { href: "/founder-performance", label: "Founder System", key: "Alt+8" },
  { href: "/idea-comparison", label: "Comparison Matrix", key: "Alt+9" },
  { href: "/exports", label: "Exports" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 h-screen w-72 border-r bg-card/80 px-4 py-5 backdrop-blur">
      <div className="mb-6 rounded-lg border bg-muted/40 p-3">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Billionaire Execution OS</p>
        <p className="mt-1 text-sm font-semibold">Path to ₹100 Cr in 36 months</p>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition",
                active ? "bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
            >
              <span>{item.label}</span>
              {item.key ? <span className="text-[10px] opacity-70">{item.key}</span> : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
