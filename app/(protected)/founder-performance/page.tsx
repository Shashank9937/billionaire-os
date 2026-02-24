import { LineChartCard } from "@/components/charts/line-chart";
import { InlineForm } from "@/components/forms/inline-form";
import { MetricCard } from "@/components/ui/metric-card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { toDateInputValue } from "@/lib/utils";

export default async function FounderPerformancePage() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const metrics = await prisma.founderMetric.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    take: 60,
  });

  const latestWeek = metrics.slice(0, 7);
  const weeklyDeepWork = latestWeek.reduce((sum, entry) => sum + entry.deepWorkHours, 0);
  const weeklyOutreach = latestWeek.reduce((sum, entry) => sum + entry.outreachCount, 0);
  const weeklyDecisions = latestWeek.reduce((sum, entry) => sum + entry.strategicDecisions, 0);
  const weeklyLearning = latestWeek.reduce((sum, entry) => sum + entry.learningHours, 0);

  const chartData = metrics
    .slice()
    .reverse()
    .map((entry) => ({
      date: entry.date.toISOString().slice(0, 10),
      deepWork: entry.deepWorkHours,
      outreach: entry.outreachCount,
      learning: entry.learningHours,
      decisions: entry.strategicDecisions,
    }));

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Module 8</p>
        <h2 className="text-2xl font-bold">Founder Performance System</h2>
        <p className="text-sm text-muted-foreground">Daily discipline inputs tied to strategic output and leverage gain.</p>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <MetricCard label="Deep Work (7d)" value={`${weeklyDeepWork.toFixed(1)} hrs`} />
        <MetricCard label="Strategic Decisions (7d)" value={String(weeklyDecisions)} />
        <MetricCard label="Outreach (7d)" value={String(weeklyOutreach)} />
        <MetricCard label="Learning (7d)" value={`${weeklyLearning.toFixed(1)} hrs`} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <LineChartCard
          title="Founder Execution Inputs"
          description="Deep work and outreach velocity"
          data={chartData}
          xKey="date"
          series={[
            { key: "deepWork", color: "#ea580c", name: "Deep Work Hours" },
            { key: "outreach", color: "#0e7490", name: "Outreach Count" },
          ]}
        />

        <LineChartCard
          title="Decision and Learning Cadence"
          description="Strategic decision frequency and learning investment"
          data={chartData}
          xKey="date"
          series={[
            { key: "decisions", color: "#16a34a", name: "Decisions" },
            { key: "learning", color: "#f59e0b", name: "Learning Hours" },
          ]}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="overflow-x-auto rounded-lg border bg-card p-3">
          <h3 className="mb-3 text-sm font-semibold">Daily Tracking Log</h3>
          <Table>
            <THead>
              <TR>
                <TH>Date</TH>
                <TH>Deep Work</TH>
                <TH>Decisions</TH>
                <TH>Outreach</TH>
                <TH>Learning</TH>
                <TH>Health</TH>
              </TR>
            </THead>
            <TBody>
              {metrics.map((entry) => (
                <TR key={entry.id}>
                  <TD>{entry.date.toISOString().slice(0, 10)}</TD>
                  <TD>{entry.deepWorkHours.toFixed(1)}h</TD>
                  <TD>{entry.strategicDecisions}</TD>
                  <TD>{entry.outreachCount}</TD>
                  <TD>{entry.learningHours.toFixed(1)}h</TD>
                  <TD>{entry.sleepHours.toFixed(1)}h / {entry.workoutMinutes}m</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-semibold">Latest Weekly Review</h3>
          {metrics[0] ? (
            <div className="mt-3 space-y-2 text-sm">
              <p><strong>Wins:</strong> {metrics[0].wins}</p>
              <p><strong>Failures:</strong> {metrics[0].failures}</p>
              <p><strong>Leverage Gained:</strong> {metrics[0].leverageGained}</p>
              <p><strong>Next Week Focus:</strong> {metrics[0].nextWeekFocus}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">No review logged yet.</p>
          )}
        </div>
      </section>

      <InlineForm endpoint="/api/founder-metrics" submitLabel="Save Founder Day">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="space-y-1"><span className="text-xs">Date</span><input name="date" type="date" defaultValue={toDateInputValue()} className="h-10 w-full rounded-md border bg-background px-3 text-sm" /></label>
          <label className="space-y-1"><span className="text-xs">Deep Work Hours</span><input name="deepWorkHours" type="number" step="0.1" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" /></label>
          <label className="space-y-1"><span className="text-xs">Strategic Decisions</span><input name="strategicDecisions" type="number" min={0} required className="h-10 w-full rounded-md border bg-background px-3 text-sm" /></label>
          <label className="space-y-1"><span className="text-xs">Outreach Count</span><input name="outreachCount" type="number" min={0} required className="h-10 w-full rounded-md border bg-background px-3 text-sm" /></label>
          <label className="space-y-1"><span className="text-xs">Learning Hours</span><input name="learningHours" type="number" step="0.1" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" /></label>
          <label className="space-y-1"><span className="text-xs">Sleep Hours</span><input name="sleepHours" type="number" step="0.1" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" /></label>
          <label className="space-y-1"><span className="text-xs">Workout Minutes</span><input name="workoutMinutes" type="number" min={0} required className="h-10 w-full rounded-md border bg-background px-3 text-sm" /></label>
          <label className="space-y-1 md:col-span-3"><span className="text-xs">Wins</span><textarea name="wins" rows={2} required className="w-full rounded-md border bg-background px-3 py-2 text-sm" /></label>
          <label className="space-y-1 md:col-span-3"><span className="text-xs">Failures</span><textarea name="failures" rows={2} required className="w-full rounded-md border bg-background px-3 py-2 text-sm" /></label>
          <label className="space-y-1 md:col-span-3"><span className="text-xs">Leverage Gained</span><textarea name="leverageGained" rows={2} required className="w-full rounded-md border bg-background px-3 py-2 text-sm" /></label>
          <label className="space-y-1 md:col-span-3"><span className="text-xs">Next Week Focus</span><textarea name="nextWeekFocus" rows={2} required className="w-full rounded-md border bg-background px-3 py-2 text-sm" /></label>
        </div>
      </InlineForm>
    </div>
  );
}
