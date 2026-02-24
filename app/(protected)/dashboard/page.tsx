import { BarChartCard } from "@/components/charts/bar-chart";
import { LineChartCard } from "@/components/charts/line-chart";
import { PieChartCard } from "@/components/charts/pie-chart";
import { InlineForm } from "@/components/forms/inline-form";
import { MetricCard } from "@/components/ui/metric-card";
import { getCurrentUser } from "@/lib/auth/session";
import { getDashboardSummary } from "@/lib/dashboard";
import { formatCurrency, formatPercentage } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const summary = await getDashboardSummary(user.id);

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Module 1</p>
        <h2 className="text-2xl font-bold">Strategic Command Center</h2>
        <p className="text-sm text-muted-foreground">
          Every metric must compress time to ₹100 Cr and increase execution leverage.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="3-Year Target" value={formatCurrency(summary.headline.targetArr)} hint="ARR target in 36 months" />
        <MetricCard label="Current ARR" value={formatCurrency(summary.headline.currentArr)} hint="Across active ventures" />
        <MetricCard label="Revenue Gap" value={formatCurrency(summary.headline.revenueGap)} hint="Remaining to target" />
        <MetricCard
          label="Growth Required"
          value={summary.headline.monthlyGrowthRequired ? formatPercentage(summary.headline.monthlyGrowthRequired) : "N/A"}
          hint="Monthly compounded"
        />
        <MetricCard label="Runway" value={`${summary.headline.runway} months`} hint="Burn-adjusted" />
        <MetricCard label="Burn Rate" value={`${formatCurrency(summary.headline.burnRate)}/mo`} hint="Portfolio burn" />
        <MetricCard
          label="Capital Deployed"
          value={formatCurrency(summary.headline.capitalDeployed)}
          hint={`Available ${formatCurrency(summary.headline.capitalAvailable)}`}
        />
        <MetricCard label="Risk Index" value={`${summary.headline.riskIndex}/100`} hint="Auto-calculated" />
        <MetricCard label="Execution Score" value={`${summary.headline.executionScore}/100`} hint="Weekly discipline score" />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <LineChartCard
          title="Revenue Trajectory vs Target"
          description="Base scenario path against linear target pace"
          data={summary.charts.revenueTrajectory}
          xKey="month"
          series={[
            { key: "projected", color: "#ea580c", name: "Projected" },
            { key: "target", color: "#0e7490", name: "Target Pace" },
          ]}
        />

        <LineChartCard
          title="Growth Rate Tracking"
          description="Weekly MRR growth and absolute MRR trend"
          data={summary.charts.growthTracking}
          xKey="week"
          series={[
            { key: "growth", color: "#16a34a", name: "Growth Rate" },
            { key: "mrr", color: "#f59e0b", name: "MRR" },
          ]}
        />

        <BarChartCard
          title="Validation Success Rate"
          description="Decision quality signal from experiments"
          data={summary.charts.validationSuccessRate.map((item) => ({ ...item, successRate: Number((item.successRate * 100).toFixed(1)) }))}
          xKey="decision"
          yKey="successRate"
          color="#0e7490"
        />

        <PieChartCard
          title="Idea Pipeline Distribution"
          description="Venture stage concentration"
          data={summary.charts.pipelineStageDistribution.map((item) => ({ name: item.stage, value: item.count }))}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-semibold">Top 3 Strategic Priorities (Editable)</h3>
          <div className="mt-3 space-y-2 text-sm">
            {summary.priorities.length ? (
              summary.priorities.map((priority, index) => (
                <InlineForm key={priority.id} endpoint={`/api/notes/${priority.id}`} submitLabel={`Update #${index + 1}`}>
                  <input name="title" defaultValue={priority.title} hidden />
                  <input name="pinned" defaultValue={String(priority.pinned)} hidden />
                  <label className="block space-y-1">
                    <span className="text-xs text-muted-foreground">Priority #{index + 1}</span>
                    <textarea
                      name="content"
                      required
                      defaultValue={priority.content}
                      rows={2}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    />
                  </label>
                </InlineForm>
              ))
            ) : (
              <p className="text-muted-foreground">No priorities configured.</p>
            )}
          </div>
        </div>

        <InlineForm endpoint="/api/notes" submitLabel="Add Priority">
          <input name="type" defaultValue="STRATEGIC_PRIORITY" hidden />
          <input name="title" defaultValue="Priority" hidden />
          <input name="pinned" defaultValue="true" hidden />
          <label className="block space-y-1">
            <span className="text-xs font-medium">Priority statement (max 3)</span>
            <textarea
              name="content"
              required
              rows={4}
              placeholder="Example: Close 3 enterprise logos with 12-month payback"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </label>
        </InlineForm>
      </section>
    </div>
  );
}
