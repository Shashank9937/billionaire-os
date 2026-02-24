import { VentureStage } from "@prisma/client";
import { InlineForm } from "@/components/forms/inline-form";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { formatCurrency, toDateInputValue } from "@/lib/utils";

const stages = Object.values(VentureStage);

export default async function ExecutionWarRoomPage() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const [ventures, milestones, kpis, ideas] = await Promise.all([
    prisma.venture.findMany({ where: { userId: user.id }, orderBy: { priorityRank: "asc" } }),
    prisma.milestone.findMany({ where: { venture: { userId: user.id } }, include: { venture: true }, orderBy: { dueDate: "asc" } }),
    prisma.kPI.findMany({ where: { venture: { userId: user.id } }, include: { venture: true }, orderBy: { weekStart: "desc" }, take: 20 }),
    prisma.idea.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Module 5</p>
        <h2 className="text-2xl font-bold">Execution War Room</h2>
        <p className="text-sm text-muted-foreground">90-day plan, weekly sprints, KPI operations, milestone control, and active risk management.</p>
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        {ventures.map((venture) => (
          <div key={venture.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold">{venture.name}</h3>
                <p className="text-xs text-muted-foreground">{venture.description}</p>
              </div>
              <Badge>{venture.stage}</Badge>
            </div>
            <div className="mt-3 grid gap-2 text-xs text-muted-foreground md:grid-cols-2">
              <p>ARR: {formatCurrency(venture.currentArr, true)}</p>
              <p>Burn: {formatCurrency(venture.monthlyBurn, true)}/mo</p>
              <p>Runway: {venture.runwayMonths} months</p>
              <p>Execution Score: {venture.executionScore}/100</p>
            </div>
            <div className="mt-3 space-y-2 text-sm">
              <p><strong>90-Day Battle Plan:</strong> {venture.ninetyDayBattlePlan}</p>
              <p><strong>Weekly Sprint Planner:</strong> {venture.weeklySprintPlanner}</p>
              <p><strong>Hiring Roadmap:</strong> {venture.hiringRoadmap}</p>
              <p><strong>Partnerships Log:</strong> {venture.partnershipsLog}</p>
              <p><strong>Bottlenecks:</strong> {venture.bottleneckTracker}</p>
              <p><strong>Risk Log:</strong> {venture.riskLog}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="overflow-x-auto rounded-lg border bg-card p-3">
          <h3 className="mb-3 text-sm font-semibold">Milestone Timeline</h3>
          <Table>
            <THead>
              <TR>
                <TH>Venture</TH>
                <TH>Milestone</TH>
                <TH>Owner</TH>
                <TH>Due</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {milestones.map((milestone) => (
                <TR key={milestone.id}>
                  <TD>{milestone.venture.name}</TD>
                  <TD>{milestone.title}</TD>
                  <TD>{milestone.owner}</TD>
                  <TD>{milestone.dueDate.toISOString().slice(0, 10)}</TD>
                  <TD>
                    <Badge>{milestone.status}</Badge>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>

        <div className="overflow-x-auto rounded-lg border bg-card p-3">
          <h3 className="mb-3 text-sm font-semibold">KPI Tracker (Recent)</h3>
          <Table>
            <THead>
              <TR>
                <TH>Venture</TH>
                <TH>Week</TH>
                <TH>MRR</TH>
                <TH>CAC</TH>
                <TH>LTV</TH>
                <TH>Churn</TH>
                <TH>GM</TH>
              </TR>
            </THead>
            <TBody>
              {kpis.map((kpi) => (
                <TR key={kpi.id}>
                  <TD>{kpi.venture.name}</TD>
                  <TD>{kpi.weekStart.toISOString().slice(0, 10)}</TD>
                  <TD>{formatCurrency(kpi.mrr, true)}</TD>
                  <TD>{formatCurrency(kpi.cac, true)}</TD>
                  <TD>{formatCurrency(kpi.ltv, true)}</TD>
                  <TD>{(kpi.churn * 100).toFixed(1)}%</TD>
                  <TD>{(kpi.grossMargin * 100).toFixed(1)}%</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <InlineForm endpoint="/api/ventures" submitLabel="Create Venture">
          <h3 className="text-sm font-semibold">Add Active Venture</h3>
          <label className="space-y-1">
            <span className="text-xs">Linked Idea (optional)</span>
            <select name="ideaId" className="h-10 w-full rounded-md border bg-background px-3 text-sm">
              <option value="">None</option>
              {ideas.map((idea) => (
                <option key={idea.id} value={idea.id}>
                  {idea.title}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1"><span className="text-xs">Name</span><input name="name" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" /></label>
          <label className="space-y-1"><span className="text-xs">Description</span><textarea name="description" required rows={2} className="w-full rounded-md border bg-background px-3 py-2 text-sm" /></label>
          <label className="space-y-1">
            <span className="text-xs">Stage</span>
            <select name="stage" className="h-10 w-full rounded-md border bg-background px-3 text-sm">
              {stages.map((stage) => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1"><span className="text-xs">90-Day Battle Plan</span><textarea name="ninetyDayBattlePlan" required rows={2} className="w-full rounded-md border bg-background px-3 py-2 text-sm" /></label>
          <label className="space-y-1"><span className="text-xs">Weekly Sprint Planner</span><textarea name="weeklySprintPlanner" required rows={2} className="w-full rounded-md border bg-background px-3 py-2 text-sm" /></label>
          <label className="space-y-1"><span className="text-xs">Hiring Roadmap</span><textarea name="hiringRoadmap" required rows={2} className="w-full rounded-md border bg-background px-3 py-2 text-sm" /></label>
          <label className="space-y-1"><span className="text-xs">Partnerships Log</span><textarea name="partnershipsLog" required rows={2} className="w-full rounded-md border bg-background px-3 py-2 text-sm" /></label>
          <label className="space-y-1"><span className="text-xs">Bottleneck Tracker</span><textarea name="bottleneckTracker" required rows={2} className="w-full rounded-md border bg-background px-3 py-2 text-sm" /></label>
          <label className="space-y-1"><span className="text-xs">Risk Log</span><textarea name="riskLog" required rows={2} className="w-full rounded-md border bg-background px-3 py-2 text-sm" /></label>
          <label className="space-y-1"><span className="text-xs">Monthly Burn</span><input name="monthlyBurn" type="number" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" /></label>
          <label className="space-y-1"><span className="text-xs">Runway Months</span><input name="runwayMonths" type="number" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" /></label>
          <label className="space-y-1"><span className="text-xs">Current ARR</span><input name="currentArr" type="number" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" /></label>
          <label className="space-y-1"><span className="text-xs">Target ARR</span><input name="targetArr" type="number" defaultValue={1000000000} required className="h-10 w-full rounded-md border bg-background px-3 text-sm" /></label>
          <label className="space-y-1"><span className="text-xs">Execution Score</span><input name="executionScore" type="number" min={0} max={100} required className="h-10 w-full rounded-md border bg-background px-3 text-sm" /></label>
          <label className="space-y-1"><span className="text-xs">Priority Rank</span><input name="priorityRank" type="number" min={1} max={10} required className="h-10 w-full rounded-md border bg-background px-3 text-sm" /></label>
          <label className="space-y-1"><span className="text-xs">Start Date</span><input name="startDate" type="date" defaultValue={toDateInputValue()} className="h-10 w-full rounded-md border bg-background px-3 text-sm" /></label>
        </InlineForm>

        <InlineForm endpoint="/api/kpis" submitLabel="Log KPI">
          <h3 className="text-sm font-semibold">Weekly KPI Entry</h3>
          <label className="space-y-1">
            <span className="text-xs">Venture</span>
            <select name="ventureId" className="h-10 w-full rounded-md border bg-background px-3 text-sm">
              {ventures.map((venture) => (
                <option key={venture.id} value={venture.id}>{venture.name}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1"><span className="text-xs">Week Start</span><input name="weekStart" type="date" defaultValue={toDateInputValue()} className="h-10 w-full rounded-md border bg-background px-3 text-sm" /></label>
          <label className="space-y-1"><span className="text-xs">MRR</span><input name="mrr" type="number" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" /></label>
          <label className="space-y-1"><span className="text-xs">CAC</span><input name="cac" type="number" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" /></label>
          <label className="space-y-1"><span className="text-xs">LTV</span><input name="ltv" type="number" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" /></label>
          <label className="space-y-1"><span className="text-xs">Churn</span><input name="churn" type="number" step="0.001" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" /></label>
          <label className="space-y-1"><span className="text-xs">Gross Margin</span><input name="grossMargin" type="number" step="0.01" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" /></label>
          <label className="space-y-1"><span className="text-xs">Conversion Rate</span><input name="conversionRate" type="number" step="0.01" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" /></label>
          <label className="space-y-1"><span className="text-xs">NPS</span><input name="nps" type="number" min={0} max={100} required className="h-10 w-full rounded-md border bg-background px-3 text-sm" /></label>
        </InlineForm>

        <InlineForm endpoint="/api/milestones" submitLabel="Create Milestone">
          <h3 className="text-sm font-semibold">Milestone Entry</h3>
          <label className="space-y-1">
            <span className="text-xs">Venture</span>
            <select name="ventureId" className="h-10 w-full rounded-md border bg-background px-3 text-sm">
              {ventures.map((venture) => (
                <option key={venture.id} value={venture.id}>{venture.name}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1"><span className="text-xs">Title</span><input name="title" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" /></label>
          <label className="space-y-1"><span className="text-xs">Description</span><textarea name="description" required rows={2} className="w-full rounded-md border bg-background px-3 py-2 text-sm" /></label>
          <label className="space-y-1"><span className="text-xs">Owner</span><input name="owner" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" /></label>
          <label className="space-y-1"><span className="text-xs">Due Date</span><input name="dueDate" type="date" defaultValue={toDateInputValue()} className="h-10 w-full rounded-md border bg-background px-3 text-sm" /></label>
          <label className="space-y-1">
            <span className="text-xs">Status</span>
            <select name="status" className="h-10 w-full rounded-md border bg-background px-3 text-sm">
              <option value="PLANNED">PLANNED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="BLOCKED">BLOCKED</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </label>
        </InlineForm>
      </section>
    </div>
  );
}
