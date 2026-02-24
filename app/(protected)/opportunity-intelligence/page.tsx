import { CreativeTechnique, MoatType } from "@prisma/client";
import { InlineForm } from "@/components/forms/inline-form";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { formatCurrency } from "@/lib/utils";

const techniques = Object.values(CreativeTechnique);
const moats = Object.values(MoatType);

export default async function OpportunityIntelligencePage() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const ideas = await prisma.idea.findMany({
    where: { userId: user.id },
    include: { evaluation: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Module 2</p>
        <h2 className="text-2xl font-bold">Opportunity Intelligence Engine</h2>
        <p className="text-sm text-muted-foreground">Capture, score, and filter venture ideas by strategic fit and speed to ₹100 Cr.</p>
      </section>

      <section className="overflow-x-auto rounded-lg border bg-card p-3">
        <Table>
          <THead>
            <TR>
              <TH>Idea</TH>
              <TH>Market</TH>
              <TH>TAM / SOM</TH>
              <TH>Moat</TH>
              <TH>Fit</TH>
              <TH>Speed</TH>
              <TH>Status</TH>
            </TR>
          </THead>
          <TBody>
            {ideas.map((idea) => (
              <TR key={idea.id}>
                <TD>
                  <p className="font-medium">{idea.title}</p>
                  <p className="text-xs text-muted-foreground">{idea.industry}</p>
                </TD>
                <TD>
                  <p>{idea.targetMarket}</p>
                  <p className="text-xs text-muted-foreground">{idea.revenueModel}</p>
                </TD>
                <TD>
                  <p>{formatCurrency(idea.tam, true)} / {formatCurrency(idea.som, true)}</p>
                  <p className="text-xs text-muted-foreground">SAM {formatCurrency(idea.sam, true)}</p>
                </TD>
                <TD>
                  <Badge>{idea.moatType}</Badge>
                  <p className="mt-1 text-xs text-muted-foreground">{idea.creativeTechnique}</p>
                </TD>
                <TD>{idea.strategicFitScore}/10</TD>
                <TD>{idea.speedTo100CrYears} yrs</TD>
                <TD>
                  <Badge>{idea.status}</Badge>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </section>

      <InlineForm endpoint="/api/ideas" submitLabel="Create Idea">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs">Title</span>
            <input name="title" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Industry</span>
            <input name="industry" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Target Market</span>
            <input name="targetMarket" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Revenue Model</span>
            <input name="revenueModel" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs">Core Pain Point</span>
            <textarea name="corePainPoint" required rows={2} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs">Unique Edge</span>
            <textarea name="uniqueEdge" required rows={2} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">TAM (INR)</span>
            <input name="tam" type="number" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">SAM (INR)</span>
            <input name="sam" type="number" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">SOM (INR)</span>
            <input name="som" type="number" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Capital Intensity (1-10)</span>
            <input name="capitalIntensity" type="number" min={1} max={10} required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Scalability (1-10)</span>
            <input name="scalabilityRating" type="number" min={1} max={10} required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Moat Type</span>
            <select name="moatType" className="h-10 w-full rounded-md border bg-background px-3 text-sm">
              {moats.map((moat) => (
                <option key={moat} value={moat}>
                  {moat}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs">Speed to ₹100 Cr (years)</span>
            <input name="speedTo100CrYears" type="number" step="0.1" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Strategic Fit (1-10)</span>
            <input name="strategicFitScore" type="number" min={1} max={10} required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Creative Technique</span>
            <select name="creativeTechnique" className="h-10 w-full rounded-md border bg-background px-3 text-sm">
              {techniques.map((technique) => (
                <option key={technique} value={technique}>
                  {technique}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs">Status</span>
            <select name="status" className="h-10 w-full rounded-md border bg-background px-3 text-sm">
              <option value="DISCOVERY">DISCOVERY</option>
              <option value="VALIDATING">VALIDATING</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="PARKED">PARKED</option>
              <option value="KILLED">KILLED</option>
            </select>
          </label>
        </div>
      </InlineForm>
    </div>
  );
}
