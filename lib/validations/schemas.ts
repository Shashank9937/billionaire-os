import { z } from "zod";

function normalizeStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n|,/) 
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeKillCriteria(value: unknown) {
  const entries = normalizeStringArray(value);

  return entries.map((entry) => {
    const failed = entry.startsWith("!") || entry.startsWith("[x]") || entry.startsWith("[X]");
    const criterion = entry.replace(/^(!|\[x\]|\[X\])\s*/, "").trim();

    return {
      criterion,
      failed,
    };
  });
}

function normalizeBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return ["1", "true", "on", "yes"].includes(value.toLowerCase());
  }

  return false;
}

function normalizeOptionalId(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const ideaSchema = z.object({
  title: z.string().min(3),
  industry: z.string().min(2),
  targetMarket: z.string().min(2),
  corePainPoint: z.string().min(8),
  uniqueEdge: z.string().min(8),
  revenueModel: z.string().min(3),
  tam: z.coerce.number().positive(),
  sam: z.coerce.number().positive(),
  som: z.coerce.number().positive(),
  capitalIntensity: z.coerce.number().int().min(1).max(10),
  scalabilityRating: z.coerce.number().int().min(1).max(10),
  moatType: z.enum(["NETWORK", "DATA", "SUPPLY", "BRAND", "REGULATION", "TECH"]),
  speedTo100CrYears: z.coerce.number().min(0.1).max(20),
  strategicFitScore: z.coerce.number().int().min(1).max(10),
  creativeTechnique: z.enum([
    "SCAMPER",
    "REVERSE_BRAINSTORMING",
    "FIRST_PRINCIPLES",
    "TEN_X_VS_TEN_PERCENT",
    "ANALOGICAL_THINKING",
    "CONSTRAINT_LADDER",
    "FUTURE_BACK",
  ]),
  status: z.enum(["DISCOVERY", "VALIDATING", "ACTIVE", "PARKED", "KILLED"]).default("DISCOVERY"),
});

export const evaluationSchema = z.object({
  ideaId: z.string().min(8),
  impact: z.coerce.number().int().min(1).max(10),
  confidence: z.coerce.number().int().min(1).max(10),
  ease: z.coerce.number().int().min(1).max(10),
  assumptions: z.preprocess(
    normalizeStringArray,
    z.array(z.string().min(3)).min(1, "At least one assumption is required"),
  ),
  criticalAssumption: z.string().min(5),
  validationExperiment: z.string().min(5),
  validationResult: z.string().min(3),
  swotStrengths: z.string().min(3),
  swotWeaknesses: z.string().min(3),
  swotOpportunities: z.string().min(3),
  swotThreats: z.string().min(3),
  killCriteriaChecklist: z.preprocess(
    normalizeKillCriteria,
    z.array(z.object({ criterion: z.string().min(3), failed: z.boolean() })).min(1),
  ),
  strategicFitScore: z.coerce.number().int().min(1).max(10),
  validationStrength: z.coerce.number().min(0).max(100),
  moatStrength: z.coerce.number().int().min(1).max(10),
  capitalEfficiency: z.coerce.number().int().min(1).max(10),
});

export const experimentSchema = z.object({
  ideaId: z.preprocess(normalizeOptionalId, z.string().optional()),
  ventureId: z.preprocess(normalizeOptionalId, z.string().optional()),
  hypothesis: z.string().min(8),
  experimentType: z.string().min(3),
  cost: z.coerce.number().min(0),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  result: z.string().min(3),
  learning: z.string().min(3),
  decision: z.enum(["SCALE", "ITERATE", "PIVOT", "KILL"]),
  status: z.enum(["PLANNED", "RUNNING", "COMPLETED"]).default("PLANNED"),
  validationStrengthScore: z.coerce.number().min(0).max(100),
});

export const ventureSchema = z.object({
  ideaId: z.preprocess(normalizeOptionalId, z.string().optional()),
  name: z.string().min(2),
  description: z.string().min(8),
  stage: z.enum(["THESIS", "VALIDATION", "BUILD", "SCALE", "OPTIMIZE"]),
  ninetyDayBattlePlan: z.string().min(10),
  weeklySprintPlanner: z.string().min(10),
  hiringRoadmap: z.string().min(5),
  partnershipsLog: z.string().min(5),
  bottleneckTracker: z.string().min(5),
  riskLog: z.string().min(5),
  monthlyBurn: z.coerce.number().min(0),
  runwayMonths: z.coerce.number().min(0),
  currentArr: z.coerce.number().min(0),
  targetArr: z.coerce.number().min(1),
  executionScore: z.coerce.number().int().min(0).max(100),
  priorityRank: z.coerce.number().int().min(1).max(10),
  startDate: z.coerce.date(),
});

export const financialModelSchema = z.object({
  ventureId: z.string().min(8),
  scenario: z.enum(["BASE", "AGGRESSIVE", "CONSERVATIVE"]),
  currentRevenue: z.coerce.number().min(0),
  monthlyGrowthRate: z.coerce.number().min(0).max(1),
  grossMargin: z.coerce.number().min(0).max(1),
  cac: z.coerce.number().min(0),
  ltv: z.coerce.number().min(0),
  churn: z.coerce.number().min(0).max(1),
  expectedIrr: z.coerce.number().min(0).max(5),
  paybackPeriodMonths: z.coerce.number().int().min(1).max(120),
});

export const capitalAllocationSchema = z.object({
  ventureId: z.string().min(8),
  capitalRequired: z.coerce.number().min(0),
  capitalDeployed: z.coerce.number().min(0),
  capitalAvailable: z.coerce.number().min(0),
  roiProjection: z.coerce.number(),
  expectedIrr: z.coerce.number().min(0).max(5),
  paybackPeriodMonths: z.coerce.number().int().min(1).max(120),
  sensitivityBase: z.coerce.number().min(0).max(1),
  sensitivityAggressive: z.coerce.number().min(0).max(1),
  sensitivityConservative: z.coerce.number().min(0).max(1),
});

export const kpiSchema = z.object({
  ventureId: z.string().min(8),
  weekStart: z.coerce.date(),
  mrr: z.coerce.number().min(0),
  cac: z.coerce.number().min(0),
  ltv: z.coerce.number().min(0),
  churn: z.coerce.number().min(0).max(1),
  grossMargin: z.coerce.number().min(0).max(1),
  conversionRate: z.coerce.number().min(0).max(1),
  nps: z.coerce.number().min(0).max(100),
});

export const milestoneSchema = z.object({
  ventureId: z.string().min(8),
  title: z.string().min(3),
  description: z.string().min(5),
  dueDate: z.coerce.date(),
  owner: z.string().min(2),
  status: z.enum(["PLANNED", "IN_PROGRESS", "BLOCKED", "COMPLETED"]).default("PLANNED"),
});

export const founderMetricSchema = z.object({
  date: z.coerce.date(),
  deepWorkHours: z.coerce.number().min(0).max(24),
  strategicDecisions: z.coerce.number().int().min(0),
  outreachCount: z.coerce.number().int().min(0),
  learningHours: z.coerce.number().min(0).max(24),
  sleepHours: z.coerce.number().min(0).max(24),
  workoutMinutes: z.coerce.number().int().min(0).max(600),
  wins: z.string().min(3),
  failures: z.string().min(3),
  leverageGained: z.string().min(3),
  nextWeekFocus: z.string().min(3),
});

export const moatMetricSchema = z.object({
  ventureId: z.string().min(8),
  date: z.coerce.date(),
  dataAssetsBuilt: z.coerce.number().int().min(0),
  supplierLockIns: z.coerce.number().int().min(0),
  customerLockInScore: z.coerce.number().min(0).max(10),
  networkEffectsGrowth: z.coerce.number().min(0).max(10),
  switchingCostIndex: z.coerce.number().min(0).max(10),
});

export const comparisonSchema = z.object({
  name: z.string().min(3),
  ideaIds: z.preprocess(
    normalizeStringArray,
    z.array(z.string().min(8)).min(2, "Choose at least 2 ideas").max(5, "Maximum 5 ideas"),
  ),
});

export const noteSchema = z.object({
  type: z.enum(["STRATEGIC_PRIORITY", "THESIS", "LESSON", "RISK", "GENERAL"]),
  title: z.string().min(2),
  content: z.string().min(3),
  pinned: z.preprocess(normalizeBoolean, z.boolean()).default(false),
});
