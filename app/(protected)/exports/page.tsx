import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export default async function ExportsPage() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const ventures = await prisma.venture.findMany({ where: { userId: user.id }, orderBy: { priorityRank: "asc" } });

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Export Center</p>
        <h2 className="text-2xl font-bold">Investor and Ops Exports</h2>
        <p className="text-sm text-muted-foreground">Download-ready artifacts for investors, operating review, and financial workflows.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <a href="/api/exports/investor-snapshot" className="rounded-lg border bg-card p-4 text-sm font-semibold hover:bg-muted/40">
          Download Investor Snapshot (PDF)
        </a>
        <a href="/api/exports/weekly-performance" className="rounded-lg border bg-card p-4 text-sm font-semibold hover:bg-muted/40">
          Download Weekly Performance Summary
        </a>
      </section>

      <section className="space-y-3 rounded-lg border bg-card p-4">
        <h3 className="text-sm font-semibold">Venture-Level Exports</h3>
        <div className="space-y-2">
          {ventures.map((venture) => (
            <div key={venture.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/20 px-3 py-2">
              <p className="text-sm font-medium">{venture.name}</p>
              <div className="flex gap-2 text-xs">
                <a
                  href={`/api/exports/venture-summary?ventureId=${venture.id}`}
                  className="rounded border px-2 py-1 hover:bg-muted"
                >
                  Venture Summary
                </a>
                <a
                  href={`/api/exports/financial-model?ventureId=${venture.id}`}
                  className="rounded border px-2 py-1 hover:bg-muted"
                >
                  Financial Model CSV
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="text-xs text-muted-foreground">
        Exports are auth-protected. Use <Link className="underline" href="/dashboard">Command Center</Link> to refresh source metrics before downloading.
      </p>
    </div>
  );
}
