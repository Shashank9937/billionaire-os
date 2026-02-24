import { PrismaClient, CreativeTechnique, ExperimentDecision, ExperimentStatus, IdeaStatus, MilestoneStatus, MoatType, NoteType, Role, Scenario, VentureStage } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const monthsProjection = (currentRevenue: number, monthlyGrowthRate: number, months = 36) => {
  const values: number[] = [];
  let revenue = currentRevenue;
  for (let i = 0; i < months; i += 1) {
    values.push(Number(revenue.toFixed(2)));
    revenue *= 1 + monthlyGrowthRate;
  }
  return values;
};

const arrProjection = (monthlyRevenue: number[]) => monthlyRevenue.map((value) => Number((value * 12).toFixed(2)));

async function main() {
  await prisma.$transaction([
    prisma.note.deleteMany(),
    prisma.comparison.deleteMany(),
    prisma.moatMetric.deleteMany(),
    prisma.founderMetric.deleteMany(),
    prisma.capitalAllocation.deleteMany(),
    prisma.milestone.deleteMany(),
    prisma.kPI.deleteMany(),
    prisma.financialModel.deleteMany(),
    prisma.experiment.deleteMany(),
    prisma.evaluation.deleteMany(),
    prisma.venture.deleteMany(),
    prisma.idea.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const passwordHash = await bcrypt.hash("Founder@123", 12);

  const founder = await prisma.user.create({
    data: {
      email: "founder@beos.local",
      fullName: "Founder Operator",
      passwordHash,
      role: Role.FOUNDER,
    },
  });

  const ideas = await prisma.$transaction([
    prisma.idea.create({
      data: {
        userId: founder.id,
        title: "AI-led Supply Chain Margin Optimizer",
        industry: "Logistics SaaS",
        targetMarket: "Indian mid-market manufacturers",
        corePainPoint: "Low visibility into margin leaks across procurement and fulfillment",
        uniqueEdge: "Proprietary cost-to-serve graph built from ERP + shipment data",
        revenueModel: "SaaS + performance fee",
        tam: 220000000000,
        sam: 28000000000,
        som: 1800000000,
        capitalIntensity: 7,
        scalabilityRating: 9,
        moatType: MoatType.DATA,
        speedTo100CrYears: 2.4,
        strategicFitScore: 9,
        creativeTechnique: CreativeTechnique.FIRST_PRINCIPLES,
        status: IdeaStatus.VALIDATING,
      },
    }),
    prisma.idea.create({
      data: {
        userId: founder.id,
        title: "SME Embedded Working Capital Intelligence",
        industry: "Fintech Infrastructure",
        targetMarket: "Export-focused SMEs",
        corePainPoint: "Cash conversion cycles are long and opaque",
        uniqueEdge: "Underwriting model trained on transaction + invoice behavior",
        revenueModel: "Take rate + platform fee",
        tam: 190000000000,
        sam: 35000000000,
        som: 2400000000,
        capitalIntensity: 8,
        scalabilityRating: 8,
        moatType: MoatType.REGULATION,
        speedTo100CrYears: 3,
        strategicFitScore: 8,
        creativeTechnique: CreativeTechnique.FUTURE_BACK,
        status: IdeaStatus.DISCOVERY,
      },
    }),
    prisma.idea.create({
      data: {
        userId: founder.id,
        title: "Vertical AI SDR for B2B Manufacturing",
        industry: "Sales Automation",
        targetMarket: "Industrial exporters",
        corePainPoint: "Low outbound conversion and slow sales cycles",
        uniqueEdge: "Domain prompts and decision trees tuned on manufacturing catalogs",
        revenueModel: "Subscription + seat expansion",
        tam: 80000000000,
        sam: 12000000000,
        som: 1000000000,
        capitalIntensity: 5,
        scalabilityRating: 9,
        moatType: MoatType.NETWORK,
        speedTo100CrYears: 2.1,
        strategicFitScore: 8,
        creativeTechnique: CreativeTechnique.TEN_X_VS_TEN_PERCENT,
        status: IdeaStatus.ACTIVE,
      },
    }),
  ]);

  const activeVenture = await prisma.venture.create({
    data: {
      userId: founder.id,
      ideaId: ideas[0].id,
      name: "MarginOS",
      description: "Execution layer for procurement and logistics profitability.",
      stage: VentureStage.BUILD,
      ninetyDayBattlePlan:
        "Acquire 6 lighthouse customers, reach 95% model precision in margin anomaly detection, and operationalize enterprise onboarding playbook.",
      weeklySprintPlanner:
        "Mon: customer calls, Tue-Wed: model and product build, Thu: GTM ops, Fri: review and de-risk assumptions.",
      hiringRoadmap: "Hire 1 product engineer, 1 data scientist, 1 enterprise AE over next 12 weeks.",
      partnershipsLog: "In-progress with Tally integrator + freight aggregator + NBFC channel partner.",
      bottleneckTracker: "Data ingestion latency from ERP connectors and slow legal procurement cycles.",
      riskLog: "Enterprise sales cycle risk; model drift risk if customer data freshness degrades.",
      monthlyBurn: 2100000,
      runwayMonths: 19,
      currentArr: 28000000,
      targetArr: 1000000000,
      executionScore: 76,
      priorityRank: 1,
      startDate: new Date("2025-07-01T00:00:00.000Z"),
    },
  });

  const pipelineVenture = await prisma.venture.create({
    data: {
      userId: founder.id,
      ideaId: ideas[2].id,
      name: "OutboundForge",
      description: "AI outbound execution stack for manufacturing exporters.",
      stage: VentureStage.VALIDATION,
      ninetyDayBattlePlan: "Validate ICP segments and reach first 10 paid pilots.",
      weeklySprintPlanner: "Pilot discovery + outbound experiments + qualification call audits.",
      hiringRoadmap: "Contract GTM ops analyst after PMF signal.",
      partnershipsLog: "Email infra and CRM marketplace partnerships under exploration.",
      bottleneckTracker: "Message personalization quality and data enrichment costs.",
      riskLog: "Commoditized AI SDR market; speed and niche depth are critical.",
      monthlyBurn: 850000,
      runwayMonths: 24,
      currentArr: 6200000,
      targetArr: 1000000000,
      executionScore: 61,
      priorityRank: 2,
      startDate: new Date("2025-10-01T00:00:00.000Z"),
    },
  });

  await prisma.$transaction([
    prisma.evaluation.create({
      data: {
        userId: founder.id,
        ideaId: ideas[0].id,
        impact: 9,
        confidence: 7,
        ease: 6,
        iceScore: 378,
        assumptions: [
          "ERP integration time can be reduced below 7 days",
          "Customers will share line-level cost data",
          "Performance pricing is acceptable to CFO persona",
        ],
        criticalAssumption: "Customers will allow deep procurement data access in first month",
        validationExperiment: "Run 2 paid pilots with integration SLA < 10 days",
        validationResult: "1 successful pilot, 1 delayed due to IT security review",
        swotStrengths: "Clear ROI signal and measurable margin outcome",
        swotWeaknesses: "Integration overhead and onboarding complexity",
        swotOpportunities: "Cross-sell spend intelligence and financing",
        swotThreats: "ERP incumbents adding lightweight analytics",
        killCriteriaChecklist: [
          { criterion: "Pilot gross margin uplift < 3%", failed: false },
          { criterion: "Payback > 12 months", failed: false },
          { criterion: "Security onboarding > 45 days", failed: false },
        ],
        viabilityIndex: 8.2,
      },
    }),
    prisma.evaluation.create({
      data: {
        userId: founder.id,
        ideaId: ideas[1].id,
        impact: 8,
        confidence: 5,
        ease: 4,
        iceScore: 160,
        assumptions: [
          "Default rates can be controlled below 2.5%",
          "Distribution partners can onboard SMEs quickly",
          "Regulatory model remains favorable",
        ],
        criticalAssumption: "Credit underwriting can outperform incumbent NBFC benchmarks",
        validationExperiment: "Underwrite 100 historical invoice cohorts",
        validationResult: "Early model beat baseline by 18% precision",
        swotStrengths: "Large market with direct capital leverage",
        swotWeaknesses: "Regulatory and underwriting complexity",
        swotOpportunities: "Embedded finance bundles",
        swotThreats: "RBI policy shifts",
        killCriteriaChecklist: [
          { criterion: "Default rate > 3.5%", failed: false },
          { criterion: "Customer acquisition payback > 9 months", failed: true },
        ],
        viabilityIndex: 6.4,
      },
    }),
    prisma.evaluation.create({
      data: {
        userId: founder.id,
        ideaId: ideas[2].id,
        impact: 8,
        confidence: 6,
        ease: 7,
        iceScore: 336,
        assumptions: [
          "Niche messaging raises meeting conversion > 4%",
          "Churn can stay below 4% monthly",
        ],
        criticalAssumption: "Differentiation against generic AI SDR tools is durable",
        validationExperiment: "Run 30-day outbound for 5 design partners",
        validationResult: "Average conversion 3.7%, high variance by segment",
        swotStrengths: "Fast build cycles and immediate customer feedback",
        swotWeaknesses: "Competitive landscape dense",
        swotOpportunities: "Vertical specialization moat",
        swotThreats: "Price compression",
        killCriteriaChecklist: [
          { criterion: "Conversion < 2.5% after tuning", failed: false },
        ],
        viabilityIndex: 7.1,
      },
    }),
  ]);

  const baseProjection = monthsProjection(2300000, 0.11);
  const aggressiveProjection = monthsProjection(2300000, 0.16);
  const conservativeProjection = monthsProjection(2300000, 0.07);

  await prisma.$transaction([
    prisma.financialModel.create({
      data: {
        ventureId: activeVenture.id,
        scenario: Scenario.BASE,
        currentRevenue: 2300000,
        monthlyGrowthRate: 0.11,
        grossMargin: 0.62,
        cac: 450000,
        ltv: 5400000,
        churn: 0.025,
        expectedIrr: 0.41,
        paybackPeriodMonths: 8,
        breakEvenMonth: 14,
        projectedRevenue36: baseProjection,
        arrProgression: arrProjection(baseProjection),
      },
    }),
    prisma.financialModel.create({
      data: {
        ventureId: activeVenture.id,
        scenario: Scenario.AGGRESSIVE,
        currentRevenue: 2300000,
        monthlyGrowthRate: 0.16,
        grossMargin: 0.68,
        cac: 390000,
        ltv: 6200000,
        churn: 0.02,
        expectedIrr: 0.57,
        paybackPeriodMonths: 6,
        breakEvenMonth: 11,
        projectedRevenue36: aggressiveProjection,
        arrProgression: arrProjection(aggressiveProjection),
      },
    }),
    prisma.financialModel.create({
      data: {
        ventureId: activeVenture.id,
        scenario: Scenario.CONSERVATIVE,
        currentRevenue: 2300000,
        monthlyGrowthRate: 0.07,
        grossMargin: 0.58,
        cac: 510000,
        ltv: 4700000,
        churn: 0.033,
        expectedIrr: 0.29,
        paybackPeriodMonths: 11,
        breakEvenMonth: 18,
        projectedRevenue36: conservativeProjection,
        arrProgression: arrProjection(conservativeProjection),
      },
    }),
  ]);

  const startWeek = new Date("2025-12-01T00:00:00.000Z");
  for (let i = 0; i < 12; i += 1) {
    const weekStart = new Date(startWeek);
    weekStart.setDate(startWeek.getDate() + i * 7);

    await prisma.kPI.create({
      data: {
        ventureId: activeVenture.id,
        weekStart,
        mrr: 2100000 + i * 220000,
        cac: 490000 - i * 7000,
        ltv: 4600000 + i * 120000,
        churn: Math.max(0.018, 0.03 - i * 0.0008),
        grossMargin: Math.min(0.72, 0.58 + i * 0.01),
        conversionRate: Math.min(0.22, 0.11 + i * 0.007),
        nps: Math.min(62, 44 + i * 1.6),
      },
    });
  }

  await prisma.$transaction([
    prisma.milestone.create({
      data: {
        ventureId: activeVenture.id,
        title: "Enterprise onboarding SLA < 8 days",
        description: "Standardize integration checklists and QA playbook.",
        dueDate: new Date("2026-04-15T00:00:00.000Z"),
        owner: "CTO",
        status: MilestoneStatus.IN_PROGRESS,
      },
    }),
    prisma.milestone.create({
      data: {
        ventureId: activeVenture.id,
        title: "Close 3 lighthouse logos",
        description: "Convert active pilots into annual contracts.",
        dueDate: new Date("2026-05-30T00:00:00.000Z"),
        owner: "Founder",
        status: MilestoneStatus.PLANNED,
      },
    }),
    prisma.milestone.create({
      data: {
        ventureId: pipelineVenture.id,
        title: "10 paid pilots",
        description: "Demonstrate repeatable outbound ROI in chosen sub-vertical.",
        dueDate: new Date("2026-06-15T00:00:00.000Z"),
        owner: "GTM Lead",
        status: MilestoneStatus.IN_PROGRESS,
      },
    }),
  ]);

  await prisma.$transaction([
    prisma.capitalAllocation.create({
      data: {
        userId: founder.id,
        ventureId: activeVenture.id,
        capitalRequired: 42000000,
        capitalDeployed: 17000000,
        capitalAvailable: 63000000,
        roiProjection: 4.6,
        expectedIrr: 0.41,
        paybackPeriodMonths: 8,
        sensitivityBase: 0.11,
        sensitivityAggressive: 0.16,
        sensitivityConservative: 0.07,
      },
    }),
    prisma.capitalAllocation.create({
      data: {
        userId: founder.id,
        ventureId: pipelineVenture.id,
        capitalRequired: 16000000,
        capitalDeployed: 4500000,
        capitalAvailable: 63000000,
        roiProjection: 3.2,
        expectedIrr: 0.34,
        paybackPeriodMonths: 10,
        sensitivityBase: 0.09,
        sensitivityAggressive: 0.13,
        sensitivityConservative: 0.05,
      },
    }),
  ]);

  await prisma.$transaction([
    prisma.experiment.create({
      data: {
        userId: founder.id,
        ideaId: ideas[0].id,
        ventureId: activeVenture.id,
        hypothesis: "Finance teams will pay for procurement leakage visibility within first 45 days.",
        experimentType: "Paid Pilot",
        cost: 580000,
        startDate: new Date("2026-01-05T00:00:00.000Z"),
        endDate: new Date("2026-02-03T00:00:00.000Z"),
        result: "1 of 2 pilots converted to annual contract.",
        learning: "Procurement head needs CFO champion for fast closure.",
        decision: ExperimentDecision.ITERATE,
        status: ExperimentStatus.COMPLETED,
        validationStrengthScore: 72,
      },
    }),
    prisma.experiment.create({
      data: {
        userId: founder.id,
        ideaId: ideas[2].id,
        ventureId: pipelineVenture.id,
        hypothesis: "Vertical-specific messaging improves outbound conversion by > 30%.",
        experimentType: "A/B Outbound Sequence",
        cost: 140000,
        startDate: new Date("2026-02-01T00:00:00.000Z"),
        endDate: new Date("2026-02-28T00:00:00.000Z"),
        result: "Variant B outperformed baseline by 24%.",
        learning: "Need tighter ICP filters to hit 30% uplift.",
        decision: ExperimentDecision.ITERATE,
        status: ExperimentStatus.RUNNING,
        validationStrengthScore: 61,
      },
    }),
  ]);

  const today = new Date("2026-02-24T00:00:00.000Z");
  for (let i = 0; i < 14; i += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    await prisma.founderMetric.create({
      data: {
        userId: founder.id,
        date,
        deepWorkHours: Number((4.5 + ((i % 4) * 0.9)).toFixed(1)),
        strategicDecisions: 2 + (i % 3),
        outreachCount: 9 + i,
        learningHours: Number((1.2 + (i % 2) * 0.6).toFixed(1)),
        sleepHours: Number((6.1 + (i % 3) * 0.5).toFixed(1)),
        workoutMinutes: 35 + (i % 4) * 10,
        wins: "Closed one high-quality customer conversation and clarified next funnel bottleneck.",
        failures: "Spent too much time on low-leverage ops decisions.",
        leverageGained: "Documented delegation SOP for recurring partnership follow-ups.",
        nextWeekFocus: "Customer conversion ops, CAC reduction, and hiring close-out.",
      },
    });
  }

  for (let i = 0; i < 10; i += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i * 7);

    await prisma.moatMetric.create({
      data: {
        userId: founder.id,
        ventureId: activeVenture.id,
        date,
        dataAssetsBuilt: 12 + i,
        supplierLockIns: 2 + Math.floor(i / 3),
        customerLockInScore: Math.min(9.5, 5.2 + i * 0.35),
        networkEffectsGrowth: Math.min(8.8, 3.1 + i * 0.42),
        switchingCostIndex: Math.min(9.2, 4.5 + i * 0.38),
      },
    });
  }

  await prisma.$transaction([
    prisma.note.create({
      data: {
        userId: founder.id,
        type: NoteType.STRATEGIC_PRIORITY,
        title: "Priority 1",
        content: "Increase net new ARR from lighthouse enterprise accounts.",
        pinned: true,
      },
    }),
    prisma.note.create({
      data: {
        userId: founder.id,
        type: NoteType.STRATEGIC_PRIORITY,
        title: "Priority 2",
        content: "Shrink onboarding time to under 8 business days.",
        pinned: true,
      },
    }),
    prisma.note.create({
      data: {
        userId: founder.id,
        type: NoteType.STRATEGIC_PRIORITY,
        title: "Priority 3",
        content: "Build defensible data moat with benchmark intelligence layer.",
        pinned: true,
      },
    }),
    prisma.comparison.create({
      data: {
        userId: founder.id,
        name: "Q1 Venture Comparison",
        ideaIds: ideas.map((idea) => idea.id),
        metrics: [
          {
            ideaId: ideas[0].id,
            title: ideas[0].title,
            ice: 378,
            validationStrength: 72,
            capitalRequired: 42000000,
            speedToScale: 2.4,
            revenuePotential: ideas[0].som,
            moatStrength: 7.8,
            strategicFit: ideas[0].strategicFitScore,
          },
          {
            ideaId: ideas[2].id,
            title: ideas[2].title,
            ice: 336,
            validationStrength: 61,
            capitalRequired: 16000000,
            speedToScale: 2.1,
            revenuePotential: ideas[2].som,
            moatStrength: 6.9,
            strategicFit: ideas[2].strategicFitScore,
          },
        ],
      },
    }),
  ]);

  console.log("Seeded founder account:");
  console.log("email: founder@beos.local");
  console.log("password: Founder@123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
