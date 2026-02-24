export function calculateIce(impact: number, confidence: number, ease: number) {
  return impact * confidence * ease;
}

export function calculateViabilityIndex(input: {
  ice: number;
  strategicFit: number;
  validationStrength: number;
  moatStrength: number;
  capitalEfficiency: number;
}) {
  const weighted =
    input.ice * 0.3 +
    input.strategicFit * 10 * 0.2 +
    input.validationStrength * 0.2 +
    input.moatStrength * 10 * 0.2 +
    input.capitalEfficiency * 10 * 0.1;

  return Number((weighted / 10).toFixed(2));
}

export function buildRevenueProjection(currentRevenue: number, monthlyGrowthRate: number, months = 36) {
  const data: number[] = [];
  let revenue = currentRevenue;

  for (let i = 0; i < months; i += 1) {
    data.push(Number(revenue.toFixed(2)));
    revenue *= 1 + monthlyGrowthRate;
  }

  return data;
}

export function breakEvenMonth(monthlyRevenue: number[], monthlyBurn: number) {
  const month = monthlyRevenue.findIndex((value) => value >= monthlyBurn);
  return month >= 0 ? month + 1 : null;
}

export function requiredMonthlyGrowth(currentArr: number, targetArr: number, months = 36) {
  if (currentArr <= 0 || targetArr <= 0) {
    return null;
  }

  return Math.pow(targetArr / currentArr, 1 / months) - 1;
}

export function calculateRiskIndex(input: {
  runwayMonths: number;
  burnRate: number;
  validationStrength: number;
  churn: number;
  concentrationRisk: number;
}) {
  const runwayRisk = Math.max(0, 1 - input.runwayMonths / 24) * 30;
  const burnRisk = Math.min(20, (input.burnRate / 5000000) * 20);
  const validationRisk = Math.max(0, (100 - input.validationStrength) * 0.2);
  const churnRisk = Math.min(20, input.churn * 300);
  const concentration = Math.min(10, input.concentrationRisk * 10);

  return Number((runwayRisk + burnRisk + validationRisk + churnRisk + concentration).toFixed(1));
}
