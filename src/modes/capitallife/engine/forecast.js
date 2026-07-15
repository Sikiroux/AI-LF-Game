import { calcExpenses, calcPassiveIncome } from "../../../engine/financing.js";
import { MAINTENANCE_COOLDOWN_DAYS } from "./assetIndicators.js";
import { rentCost } from "./lifestyle.js";

export function computeForecast({ day, cash, profession, debts = [], liabilities = {}, kids = 0, assets = [], rentTier }) {
  if (!profession) return null;
  const currentDay = Math.max(1, day || 1);
  const nextPaydayDay = currentDay - ((currentDay - 1) % 30) + 30;
  const daysUntilPayday = nextPaydayDay - currentDay;
  const debtMonthly = debts.reduce((sum, debt) => sum + (debt.monthlyPayment || 0), 0);
  const rent = rentTier ? rentCost(rentTier, profession.salary) : 0;
  const monthlyExpenses = calcExpenses(profession, kids, debtMonthly, liabilities) + rent;
  const passiveIncome = calcPassiveIncome(assets);
  const totalIncome = profession.salary + passiveIncome;
  const expectedPayday = totalIncome - monthlyExpenses;
  const assetLoanPayments = assets.reduce((sum, asset) => sum + (asset.loanMonthly || 0), 0);
  const expenseKeys = ["mortgage", "carLoan", "creditCard", "schoolLoan"];
  const liabilityPayments = expenseKeys.reduce((sum, key) => sum + ((liabilities[key] || 0) > 0 ? (profession.expenses[key] || 0) : 0), 0);
  const monthlyDebtPayments = debtMonthly + assetLoanPayments + liabilityPayments;
  const debtRatio = totalIncome > 0 ? monthlyDebtPayments / totalIncome : (monthlyDebtPayments > 0 ? Infinity : 0);
  const assetEquity = assets.reduce((sum, asset) => sum + (asset.value ?? asset.marketValue ?? asset.cost ?? 0) - (asset.loanBalance || 0), 0);
  const remainingDebts = debts.reduce((sum, debt) => sum + (debt.balance ?? (debt.monthlyPayment || 0) * (debt.monthsRemaining || 0)), 0);
  const remainingLiabilities = Object.values(liabilities).reduce((sum, balance) => sum + (Number(balance) || 0), 0);
  const upcomingMaintenance = assets
    .filter((asset) => asset.condition != null)
    .map((asset) => {
      const elapsed = asset.lastMaintenanceDay == null ? MAINTENANCE_COOLDOWN_DAYS : currentDay - asset.lastMaintenanceDay;
      return { id: asset.id, name: asset.name, daysUntilEligible: Math.max(0, MAINTENANCE_COOLDOWN_DAYS - elapsed) };
    })
    .filter((asset) => asset.daysUntilEligible <= 7)
    .sort((a, b) => a.daysUntilEligible - b.daysUntilEligible);

  return {
    nextPaydayDay,
    daysUntilPayday,
    expectedPayday,
    monthsOfRunway: monthlyExpenses > 0 ? Math.max(0, cash) / monthlyExpenses : Infinity,
    debtRatio,
    netWorth: cash + assetEquity - remainingDebts - remainingLiabilities,
    upcomingMaintenance,
    monthlyExpenses,
    totalIncome,
  };
}
