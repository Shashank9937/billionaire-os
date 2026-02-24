import { NextRequest } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { requirePermission } from "@/lib/auth/guards";
import { getDashboardSummary } from "@/lib/dashboard";
import { prisma } from "@/lib/db/prisma";
import { fail } from "@/lib/http";

export async function GET(request: NextRequest) {
  const session = await requirePermission(request, "exportData");
  if (session === "UNAUTHORIZED") {
    return fail("Unauthorized", 401);
  }

  if (session === "FORBIDDEN") {
    return fail("Forbidden", 403);
  }

  const summary = await getDashboardSummary(session.sub);
  const topVentures = await prisma.venture.findMany({
    where: { userId: session.sub },
    orderBy: { currentArr: "desc" },
    take: 3,
  });

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = 800;
  const draw = (text: string, size = 11, isBold = false) => {
    page.drawText(text, {
      x: 40,
      y,
      size,
      font: isBold ? bold : font,
      color: rgb(0.12, 0.14, 0.19),
    });
    y -= size + 10;
  };

  draw("Billionaire Execution OS - Investor Snapshot", 16, true);
  draw(`Date: ${new Date().toISOString().slice(0, 10)}`);
  y -= 4;

  draw("Target and Traction", 13, true);
  draw(`3-Year Target ARR: INR ${summary.headline.targetArr.toLocaleString("en-IN")}`);
  draw(`Current ARR: INR ${summary.headline.currentArr.toLocaleString("en-IN")}`);
  draw(`Revenue Gap: INR ${summary.headline.revenueGap.toLocaleString("en-IN")}`);
  draw(`Runway: ${summary.headline.runway} months`);
  draw(`Burn Rate: INR ${summary.headline.burnRate.toLocaleString("en-IN")} / month`);
  draw(`Execution Score: ${summary.headline.executionScore}/100`);
  draw(`Risk Index: ${summary.headline.riskIndex}/100`);

  y -= 8;
  draw("Top Strategic Priorities", 13, true);
  summary.priorities.forEach((priority, index) => draw(`${index + 1}. ${priority.content}`));

  y -= 8;
  draw("Top Ventures", 13, true);
  topVentures.forEach((venture) => {
    draw(`${venture.name} | Stage: ${venture.stage} | ARR: INR ${venture.currentArr.toLocaleString("en-IN")}`);
  });

  y -= 8;
  draw("Strategic Positioning", 13, true);
  draw("Focus remains on high-leverage B2B ventures with measurable unit economics and defensibility.");

  const bytes = await pdfDoc.save();

  return new Response(bytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="investor-snapshot.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
