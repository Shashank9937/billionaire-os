import { InlineForm } from "@/components/forms/inline-form";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export default async function DecisionEnginePage() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const [ideas, evaluations] = await Promise.all([
    prisma.idea.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.evaluation.findMany({
      where: { userId: user.id },
      include: { idea: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Module 3</p>
        <h2 className="text-2xl font-bold">Decision Engine</h2>
        <p className="text-sm text-muted-foreground">ICE scoring, riskiest assumptions, kill criteria, and venture viability index.</p>
      </section>

      <section className="overflow-x-auto rounded-lg border bg-card p-3">
        <Table>
          <THead>
            <TR>
              <TH>Idea</TH>
              <TH>ICE</TH>
              <TH>Viability</TH>
              <TH>Critical Assumption</TH>
              <TH>Kill Criteria</TH>
              <TH>Validation</TH>
            </TR>
          </THead>
          <TBody>
            {evaluations.map((evaluation) => (
              <TR key={evaluation.id}>
                <TD>
                  <p className="font-medium">{evaluation.idea.title}</p>
                  <p className="text-xs text-muted-foreground">{evaluation.idea.status}</p>
                </TD>
                <TD>{evaluation.iceScore.toFixed(1)}</TD>
                <TD>{evaluation.viabilityIndex.toFixed(2)}</TD>
                <TD>{evaluation.criticalAssumption}</TD>
                <TD>
                  {Array.isArray(evaluation.killCriteriaChecklist)
                    ? `${evaluation.killCriteriaChecklist.length} criteria`
                    : "0 criteria"}
                </TD>
                <TD>
                  <Badge>{evaluation.validationResult.slice(0, 28)}</Badge>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </section>

      <InlineForm endpoint="/api/evaluations" submitLabel="Run Decision Model">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="space-y-1 md:col-span-3">
            <span className="text-xs">Idea</span>
            <select name="ideaId" required className="h-10 w-full rounded-md border bg-background px-3 text-sm">
              {ideas.map((idea) => (
                <option key={idea.id} value={idea.id}>
                  {idea.title}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs">Impact (1-10)</span>
            <input name="impact" type="number" min={1} max={10} required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Confidence (1-10)</span>
            <input name="confidence" type="number" min={1} max={10} required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Ease (1-10)</span>
            <input name="ease" type="number" min={1} max={10} required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
          </label>

          <label className="space-y-1 md:col-span-3">
            <span className="text-xs">Assumptions (one per line)</span>
            <textarea name="assumptions" rows={3} required className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1 md:col-span-3">
            <span className="text-xs">Critical Assumption</span>
            <textarea name="criticalAssumption" rows={2} required className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1 md:col-span-3">
            <span className="text-xs">Validation Experiment</span>
            <textarea name="validationExperiment" rows={2} required className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1 md:col-span-3">
            <span className="text-xs">Validation Result</span>
            <textarea name="validationResult" rows={2} required className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </label>

          <label className="space-y-1">
            <span className="text-xs">SWOT: Strengths</span>
            <textarea name="swotStrengths" rows={2} required className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">SWOT: Weaknesses</span>
            <textarea name="swotWeaknesses" rows={2} required className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">SWOT: Opportunities</span>
            <textarea name="swotOpportunities" rows={2} required className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1 md:col-span-3">
            <span className="text-xs">SWOT: Threats</span>
            <textarea name="swotThreats" rows={2} required className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </label>

          <label className="space-y-1 md:col-span-3">
            <span className="text-xs">Kill Criteria (one per line, prefix with ! if currently failed)</span>
            <textarea name="killCriteriaChecklist" rows={3} required className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </label>

          <label className="space-y-1">
            <span className="text-xs">Strategic Fit (1-10)</span>
            <input name="strategicFitScore" type="number" min={1} max={10} required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Validation Strength (0-100)</span>
            <input name="validationStrength" type="number" min={0} max={100} required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Moat Strength (1-10)</span>
            <input name="moatStrength" type="number" min={1} max={10} required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Capital Efficiency (1-10)</span>
            <input name="capitalEfficiency" type="number" min={1} max={10} required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
          </label>
        </div>
      </InlineForm>
    </div>
  );
}
