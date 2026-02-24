import { InlineForm } from "@/components/forms/inline-form";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { formatCurrency } from "@/lib/utils";

type MatrixRow = {
  ideaId: string;
  title: string;
  ice: number;
  validationStrength: number;
  capitalRequired: number;
  speedToScale: number;
  revenuePotential: number;
  moatStrength: number;
  strategicFit: number;
};

export default async function IdeaComparisonPage() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const [ideas, comparisons] = await Promise.all([
    prisma.idea.findMany({
      where: { userId: user.id },
      include: {
        evaluation: true,
        venture: {
          include: {
            capitalAllocations: true,
            moatMetrics: { orderBy: { date: "desc" }, take: 1 },
          },
        },
        experiments: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.comparison.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" }, take: 10 }),
  ]);

  const rawMetrics = comparisons[0]?.metrics;
  const latestMatrix = Array.isArray(rawMetrics) ? (rawMetrics as MatrixRow[]).slice(0, 5) : [];

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Module 9</p>
        <h2 className="text-2xl font-bold">Idea Comparison Matrix</h2>
        <p className="text-sm text-muted-foreground">Compare 2-5 ventures on execution impact, capital efficiency, speed, and defensibility.</p>
      </section>

      <section className="overflow-x-auto rounded-lg border bg-card p-3">
        <h3 className="mb-3 text-sm font-semibold">Latest Saved Matrix</h3>
        <Table>
          <THead>
            <TR>
              <TH>Idea</TH>
              <TH>ICE</TH>
              <TH>Validation</TH>
              <TH>Capital Required</TH>
              <TH>Speed to Scale</TH>
              <TH>Revenue Potential</TH>
              <TH>Moat Strength</TH>
              <TH>Strategic Fit</TH>
            </TR>
          </THead>
          <TBody>
            {latestMatrix.map((row) => (
              <TR key={row.ideaId}>
                <TD>{row.title}</TD>
                <TD>{row.ice.toFixed(1)}</TD>
                <TD>{row.validationStrength.toFixed(1)}</TD>
                <TD>{formatCurrency(row.capitalRequired, true)}</TD>
                <TD>{row.speedToScale} yrs</TD>
                <TD>{formatCurrency(row.revenuePotential, true)}</TD>
                <TD>{row.moatStrength.toFixed(1)}</TD>
                <TD>{row.strategicFit.toFixed(1)}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </section>

      <InlineForm endpoint="/api/comparisons" submitLabel="Generate Comparison">
        <label className="space-y-1 block">
          <span className="text-xs">Comparison Name</span>
          <input name="name" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
        </label>
        <div className="grid gap-2 md:grid-cols-2">
          {ideas.map((idea) => (
            <label key={idea.id} className="flex items-center gap-2 rounded-md border bg-muted/20 px-3 py-2 text-sm">
              <input name="ideaIds[]" type="checkbox" value={idea.id} className="size-4" />
              <span>{idea.title}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Select between 2 and 5 ventures to generate a matrix.</p>
      </InlineForm>

      <section className="rounded-lg border bg-card p-3">
        <h3 className="mb-2 text-sm font-semibold">Recent Comparison Runs</h3>
        <ul className="space-y-2 text-sm">
          {comparisons.map((comparison) => (
            <li key={comparison.id} className="rounded-md border bg-muted/20 p-2">
              <p className="font-medium">{comparison.name}</p>
              <p className="text-xs text-muted-foreground">{comparison.updatedAt.toISOString().slice(0, 10)} | {comparison.ideaIds.length} ideas</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
