import { Scenario } from "@prisma/client";
import { LineChartCard } from "@/components/charts/line-chart";
import { InlineForm } from "@/components/forms/inline-form";
import { MetricCard } from "@/components/ui/metric-card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { formatCurrency, formatPercentage } from "@/lib/utils";

export default async function CapitalAllocationPage() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const [ventures, allocations, financialModels] = await Promise.all([
    prisma.venture.findMany({ where: { userId: user.id }, orderBy: { priorityRank: "asc" } }),
    prisma.capitalAllocation.findMany({ where: { userId: user.id }, include: { venture: true }, orderBy: { createdAt: "desc" } }),
    prisma.financialModel.findMany({
      where: { venture: { userId: user.id } },
      include: { venture: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const totalRequired = allocations.reduce((sum, allocation) => sum + allocation.capitalRequired, 0);
  const totalDeployed = allocations.reduce((sum, allocation) => sum + allocation.capitalDeployed, 0);
  const totalAvailable = allocations.reduce((sum, allocation) => sum + allocation.capitalAvailable, 0);

  const referenceVenture = ventures[0];
  const refModels = financialModels.filter((model) => model.ventureId === referenceVenture?.id);
  const baseModel = refModels.find((model) => model.scenario === Scenario.BASE);
  const aggressiveModel = refModels.find((model) => model.scenario === Scenario.AGGRESSIVE);
  const conservativeModel = refModels.find((model) => model.scenario === Scenario.CONSERVATIVE);

  const scenarioSeries = Array.from({ length: 36 }, (_, index) => ({
    month: index + 1,
    base: ((baseModel?.projectedRevenue36 as number[] | undefined) ?? [])[index] ?? 0,
    aggressive: ((aggressiveModel?.projectedRevenue36 as number[] | undefined) ?? [])[index] ?? 0,
    conservative: ((conservativeModel?.projectedRevenue36 as number[] | undefined) ?? [])[index] ?? 0,
  }));

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Module 4</p>
        <h2 className="text-2xl font-bold">Capital Allocation System</h2>
        <p className="text-sm text-muted-foreground">
          Capital follows validated leverage. Track required vs deployed capital, ROI, IRR, and scenario sensitivity.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <MetricCard label="Capital Required" value={formatCurrency(totalRequired)} />
        <MetricCard label="Capital Deployed" value={formatCurrency(totalDeployed)} />
        <MetricCard label="Capital Available" value={formatCurrency(totalAvailable)} />
        <MetricCard
          label="Deployment Ratio"
          value={totalRequired ? formatPercentage(totalDeployed / totalRequired) : "0%"}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <LineChartCard
          title="36-Month Revenue Scenario"
          description={referenceVenture ? `${referenceVenture.name} projection` : "Add a venture and financial model to view"}
          data={scenarioSeries}
          xKey="month"
          series={[
            { key: "base", color: "#ea580c", name: "Base" },
            { key: "aggressive", color: "#16a34a", name: "Aggressive" },
            { key: "conservative", color: "#0e7490", name: "Conservative" },
          ]}
        />

        <div className="overflow-x-auto rounded-lg border bg-card p-3">
          <Table>
            <THead>
              <TR>
                <TH>Venture</TH>
                <TH>Required</TH>
                <TH>Deployed</TH>
                <TH>ROI</TH>
                <TH>Expected IRR</TH>
                <TH>Payback</TH>
              </TR>
            </THead>
            <TBody>
              {allocations.map((allocation) => (
                <TR key={allocation.id}>
                  <TD>{allocation.venture.name}</TD>
                  <TD>{formatCurrency(allocation.capitalRequired, true)}</TD>
                  <TD>{formatCurrency(allocation.capitalDeployed, true)}</TD>
                  <TD>{allocation.roiProjection.toFixed(2)}x</TD>
                  <TD>{formatPercentage(allocation.expectedIrr)}</TD>
                  <TD>{allocation.paybackPeriodMonths} mo</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <InlineForm endpoint="/api/financial-models" submitLabel="Save Financial Model">
          <h3 className="text-sm font-semibold">Financial Model Input</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 md:col-span-2">
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
              <span className="text-xs">Scenario</span>
              <select name="scenario" className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                <option value="BASE">BASE</option>
                <option value="AGGRESSIVE">AGGRESSIVE</option>
                <option value="CONSERVATIVE">CONSERVATIVE</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs">Current Revenue</span>
              <input name="currentRevenue" type="number" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
            </label>
            <label className="space-y-1">
              <span className="text-xs">Monthly Growth Rate</span>
              <input name="monthlyGrowthRate" type="number" step="0.01" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
            </label>
            <label className="space-y-1">
              <span className="text-xs">Gross Margin</span>
              <input name="grossMargin" type="number" step="0.01" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
            </label>
            <label className="space-y-1">
              <span className="text-xs">CAC</span>
              <input name="cac" type="number" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
            </label>
            <label className="space-y-1">
              <span className="text-xs">LTV</span>
              <input name="ltv" type="number" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
            </label>
            <label className="space-y-1">
              <span className="text-xs">Churn</span>
              <input name="churn" type="number" step="0.001" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
            </label>
            <label className="space-y-1">
              <span className="text-xs">Expected IRR</span>
              <input name="expectedIrr" type="number" step="0.01" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
            </label>
            <label className="space-y-1">
              <span className="text-xs">Payback (months)</span>
              <input name="paybackPeriodMonths" type="number" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
            </label>
          </div>
        </InlineForm>

        <InlineForm endpoint="/api/capital-allocations" submitLabel="Allocate Capital">
          <h3 className="text-sm font-semibold">Capital Allocation Input</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 md:col-span-2">
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
              <span className="text-xs">Capital Required</span>
              <input name="capitalRequired" type="number" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
            </label>
            <label className="space-y-1">
              <span className="text-xs">Capital Deployed</span>
              <input name="capitalDeployed" type="number" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
            </label>
            <label className="space-y-1">
              <span className="text-xs">Capital Available</span>
              <input name="capitalAvailable" type="number" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
            </label>
            <label className="space-y-1">
              <span className="text-xs">ROI Projection (x)</span>
              <input name="roiProjection" type="number" step="0.1" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
            </label>
            <label className="space-y-1">
              <span className="text-xs">Expected IRR</span>
              <input name="expectedIrr" type="number" step="0.01" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
            </label>
            <label className="space-y-1">
              <span className="text-xs">Payback Months</span>
              <input name="paybackPeriodMonths" type="number" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
            </label>
            <label className="space-y-1">
              <span className="text-xs">Sensitivity Base</span>
              <input name="sensitivityBase" type="number" step="0.01" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
            </label>
            <label className="space-y-1">
              <span className="text-xs">Sensitivity Aggressive</span>
              <input name="sensitivityAggressive" type="number" step="0.01" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
            </label>
            <label className="space-y-1">
              <span className="text-xs">Sensitivity Conservative</span>
              <input name="sensitivityConservative" type="number" step="0.01" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
            </label>
          </div>
        </InlineForm>
      </section>
    </div>
  );
}
