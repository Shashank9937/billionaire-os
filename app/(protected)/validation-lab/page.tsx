import { BarChartCard } from "@/components/charts/bar-chart";
import { InlineForm } from "@/components/forms/inline-form";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/ui/metric-card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { formatCurrency, toDateInputValue } from "@/lib/utils";

export default async function ValidationLabPage() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const [experiments, ideas, ventures] = await Promise.all([
    prisma.experiment.findMany({
      where: { userId: user.id },
      include: { idea: true, venture: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.idea.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.venture.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
  ]);

  const avgStrength = experiments.length
    ? experiments.reduce((sum, exp) => sum + exp.validationStrengthScore, 0) / experiments.length
    : 0;

  const decisionMap = experiments.reduce<Record<string, number>>((acc, experiment) => {
    acc[experiment.decision] = (acc[experiment.decision] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Module 6</p>
        <h2 className="text-2xl font-bold">Validation Lab</h2>
        <p className="text-sm text-muted-foreground">Track hypotheses, experiment economics, learning velocity, and decision quality.</p>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <MetricCard label="Experiments Logged" value={String(experiments.length)} />
        <MetricCard label="Validation Strength" value={`${avgStrength.toFixed(1)}/100`} />
        <MetricCard
          label="Total Validation Spend"
          value={formatCurrency(experiments.reduce((sum, exp) => sum + exp.cost, 0))}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <BarChartCard
          title="Decision Distribution"
          description="Scale / Iterate / Pivot / Kill split"
          data={Object.entries(decisionMap).map(([decision, count]) => ({ decision, count }))}
          xKey="decision"
          yKey="count"
          color="#16a34a"
        />

        <div className="overflow-x-auto rounded-lg border bg-card p-3">
          <Table>
            <THead>
              <TR>
                <TH>Hypothesis</TH>
                <TH>Type</TH>
                <TH>Cost</TH>
                <TH>Result</TH>
                <TH>Decision</TH>
                <TH>Strength</TH>
              </TR>
            </THead>
            <TBody>
              {experiments.map((experiment) => (
                <TR key={experiment.id}>
                  <TD>{experiment.hypothesis}</TD>
                  <TD>{experiment.experimentType}</TD>
                  <TD>{formatCurrency(experiment.cost, true)}</TD>
                  <TD>{experiment.result}</TD>
                  <TD>
                    <Badge>{experiment.decision}</Badge>
                  </TD>
                  <TD>{experiment.validationStrengthScore}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      </section>

      <InlineForm endpoint="/api/experiments" submitLabel="Log Experiment">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs">Idea (optional)</span>
            <select name="ideaId" className="h-10 w-full rounded-md border bg-background px-3 text-sm">
              <option value="">None</option>
              {ideas.map((idea) => (
                <option key={idea.id} value={idea.id}>
                  {idea.title}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs">Venture (optional)</span>
            <select name="ventureId" className="h-10 w-full rounded-md border bg-background px-3 text-sm">
              <option value="">None</option>
              {ventures.map((venture) => (
                <option key={venture.id} value={venture.id}>
                  {venture.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs">Hypothesis</span>
            <textarea name="hypothesis" rows={2} required className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Experiment Type</span>
            <input name="experimentType" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Cost</span>
            <input name="cost" type="number" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1"><span className="text-xs">Start Date</span><input name="startDate" type="date" defaultValue={toDateInputValue()} className="h-10 w-full rounded-md border bg-background px-3 text-sm" /></label>
          <label className="space-y-1"><span className="text-xs">End Date</span><input name="endDate" type="date" defaultValue={toDateInputValue()} className="h-10 w-full rounded-md border bg-background px-3 text-sm" /></label>
          <label className="space-y-1 md:col-span-2"><span className="text-xs">Result</span><textarea name="result" rows={2} required className="w-full rounded-md border bg-background px-3 py-2 text-sm" /></label>
          <label className="space-y-1 md:col-span-2"><span className="text-xs">Learning</span><textarea name="learning" rows={2} required className="w-full rounded-md border bg-background px-3 py-2 text-sm" /></label>
          <label className="space-y-1">
            <span className="text-xs">Decision</span>
            <select name="decision" className="h-10 w-full rounded-md border bg-background px-3 text-sm">
              <option value="SCALE">SCALE</option>
              <option value="ITERATE">ITERATE</option>
              <option value="PIVOT">PIVOT</option>
              <option value="KILL">KILL</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs">Status</span>
            <select name="status" className="h-10 w-full rounded-md border bg-background px-3 text-sm">
              <option value="PLANNED">PLANNED</option>
              <option value="RUNNING">RUNNING</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs">Validation Strength (0-100)</span>
            <input name="validationStrengthScore" type="number" min={0} max={100} required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
          </label>
        </div>
      </InlineForm>
    </div>
  );
}
