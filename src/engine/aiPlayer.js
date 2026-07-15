import { computeFinancing, getYieldMultiplier, MAX_DEBT_RATIO, BANK_LOAN_UNIT } from "./financing.js";

const SAFETY_CASH_FACTOR = 3; // toujours garder ~3 mois de dépenses de côté
const MIN_YIELD_RATIO = 0.015; // cashflow net mensuel / apport, seuil minimal pour acheter

export function aiSafetyCash(totalExpenses) {
  return Math.max(1000, totalExpenses * SAFETY_CASH_FACTOR);
}

export function aiDecideOpportunity(card, ctx) {
  const { cash, financingMode, downPaymentPct, yieldMode, customYieldMultiplier, loanRateMult, debtRatioEnabled, currentDebtPayments, totalIncome, totalExpenses } = ctx;
  const safety = aiSafetyCash(totalExpenses);
  const financeable = card.type !== "stock";
  if (financeable) {
    const fin = computeFinancing(card, financingMode, downPaymentPct, loanRateMult, yieldMode, customYieldMultiplier);
    const ratio = totalIncome > 0 ? (currentDebtPayments + fin.loanMonthly) / totalIncome : 0;
    const ratioOk = !debtRatioEnabled || ratio <= MAX_DEBT_RATIO;
    const affordable = cash - fin.downPayment >= safety;
    const yieldRatio = fin.downPayment > 0 ? fin.netCashflow / fin.downPayment : 0;
    if (affordable && ratioOk && fin.netCashflow > 0 && yieldRatio >= MIN_YIELD_RATIO) {
      return { buy: true, mode: true };
    }
  }
  const yieldMult = getYieldMultiplier(yieldMode, customYieldMultiplier);
  const grossCashflow = Math.round(card.cashflow * yieldMult);
  if (card.cost > 0 && cash - card.cost >= safety && grossCashflow / card.cost >= MIN_YIELD_RATIO) {
    return { buy: true, mode: false };
  }
  return { buy: false, mode: false };
}

export function aiDecideDoodad(card, ctx) {
  const { cash, totalExpenses } = ctx;
  const safety = aiSafetyCash(totalExpenses);
  return { finance: cash - card.amount < safety * 0.5 };
}

export function aiDecideMarketSell(card) {
  return { sell: card.mult >= 1.15 };
}

export function aiDecideCharity(ctx) {
  const { cash, totalExpenses } = ctx;
  return { give: cash > aiSafetyCash(totalExpenses) * 1.5 };
}

export function aiDecideFastBusiness(deal, ctx) {
  const { fastCash, fastIncome } = ctx;
  const safety = Math.max(1000, fastIncome * 2);
  if (fastCash - deal.cost < safety) return { buy: false };
  const ratio = deal.cost > 0 ? deal.incomeGain / deal.cost : 0;
  return { buy: ratio >= 0.01 };
}

export function aiDecideFastCharity(ctx) {
  const { fastCash, fastIncome } = ctx;
  return { give: fastCash > fastIncome * 4 };
}

export function aiRepayBankLoanUnits(ctx) {
  const { cash, totalExpenses, bankLoanBalance } = ctx;
  if (!(bankLoanBalance > 0)) return 0;
  const safety = aiSafetyCash(totalExpenses);
  const spare = cash - safety;
  if (spare <= 0) return 0;
  return Math.floor(Math.min(spare, bankLoanBalance) / BANK_LOAN_UNIT);
}
