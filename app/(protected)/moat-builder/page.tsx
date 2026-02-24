import { LineChartCard } from "@/components/charts/line-chart";
import { InlineForm } from "@/components/forms/inline-form";
import { MetricCard } from "@/components/ui/metric-card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { toDateInputValue } from "@/lib/utils";

export default async function MoatBuilderPage() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const [ventures, metrics] = await Promise.all([
    prisma.venture.findMany({ where: { userId: user.id }, orderBy: { priorityRank: "asc" } }),
    prisma.moatMetric.findMany({
      where: { userId: user.id },
      include: { venture: true },
      orderBy: { date: "asc" },
      take: 120,
    }),
  ]);

  const latest = metrics.at(-1);

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Module 7</p>
        <h2 className="text-2xl font-bold">Moat Builder Panel</h2>
        <p className="text-sm text-muted-foreground">Track defensibility metrics: data assets, lock-ins, network effects, and switching costs.</p>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <MetricCard label="Data Assets Built" value={String(latest?.dataAssetsBuilt ?? 0)} />
        <MetricCard label="Supplier Lock-ins" value={String(latest?.supplierLockIns ?? 0)} />
        <MetricCard label="Customer Lock-in" value={(latest?.customerLockInScore ?? 0).toFixed(1)} />
        <MetricCard label="Switching Cost" value={(latest?.switchingCostIndex ?? 0).toFixed(1)} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <LineChartCard
          title="Moat Strength Over Time"
          description="Core defensibility indicators"
          data={metrics.map((metric) => ({
            date: metric.date.toISOString().slice(0, 10),
            customerLockIn: metric.customerLockInScore,
            networkEffects: metric.networkEffectsGrowth,
            switchingCost: metric.switchingCostIndex,
          }))}
          xKey="date"
          series={[
            { key: "customerLockIn", color: "#ea580c", name: "Customer Lock-in" },
            { key: "networkEffects", color: "#16a34a", name: "Network Effects" },
            { key: "switchingCost", color: "#0e7490", name: "Switching Cost" },
          ]}
        />

        <div className="overflow-x-auto rounded-lg border bg-card p-3">
          <Table>
            <THead>
              <TR>
                <TH>Date</TH>
                <TH>Venture</TH>
                <TH>Data Assets</TH>
                <TH>Supplier Lock-ins</TH>
                <TH>Customer Lock-in</TH>
                <TH>Network Effects</TH>
                <TH>Switching Cost</TH>
              </TR>
            </THead>
            <TBody>
              {metrics
                .slice()
                .reverse()
                .map((metric) => (
                  <TR key={metric.id}>
                    <TD>{metric.date.toISOString().slice(0, 10)}</TD>
                    <TD>{metric.venture.name}</TD>
                    <TD>{metric.dataAssetsBuilt}</TD>
                    <TD>{metric.supplierLockIns}</TD>
                    <TD>{metric.customerLockInScore.toFixed(1)}</TD>
                    <TD>{metric.networkEffectsGrowth.toFixed(1)}</TD>
                    <TD>{metric.switchingCostIndex.toFixed(1)}</TD>
                  </TR>
                ))}
            </TBody>
          </Table>
        </div>
      </section>

      <InlineForm endpoint="/api/moat-metrics" submitLabel="Record Moat Metric">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="space-y-1 md:col-span-3">
            <span className="text-xs">Venture</span>
            <select name="ventureId" className="h-10 w-full rounded-md border bg-background px-3 text-sm">
              {ventures.map((venture) => (
                <option key={venture.id} value={venture.id}>
                  {venture.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs">Date</span>
            <input name="date" type="date" defaultValue={toDateInputValue()} className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Data Assets Built</span>
            <input name="dataAssetsBuilt" type="number" min={0} required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Supplier Lock-ins</span>
            <input name="supplierLockIns" type="number" min={0} required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Customer Lock-in Score</span>
            <input name="customerLockInScore" type="number" min={0} max={10} step="0.1" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Network Effects Growth</span>
            <input name="networkEffectsGrowth" type="number" min={0} max={10} step="0.1" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Switching Cost Index</span>
            <input name="switchingCostIndex" type="number" min={0} max={10} step="0.1" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
          </label>
        </div>
      </InlineForm>
    </div>
  );
}
