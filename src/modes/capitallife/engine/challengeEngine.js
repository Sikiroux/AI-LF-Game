export function challengeDebtTotal({ debts = [], liabilities = {}, assets = [] }) {
  const personal = debts.reduce((sum, debt) => sum + Math.max(0, Number(debt.balance) || 0), 0);
  const starting = Object.values(liabilities).reduce((sum, balance) => sum + Math.max(0, Number(balance) || 0), 0);
  const assetLoans = assets.reduce((sum, asset) => sum + Math.max(0, Number(asset.loanBalance) || 0), 0);
  return personal + starting + assetLoans;
}

export function evaluateChallenge(challenge, state) {
  if (!challenge) return null;
  const elapsedDays = Math.max(0, state.day - (state.challengeStartDay || 1));
  const daysRemaining = Math.max(0, challenge.durationDays - elapsedDays);
  const debtRemaining = challengeDebtTotal(state);
  const initialDebt = Math.max(1, state.challengeInitialDebt || debtRemaining);
  const debtProgressPct = Math.max(0, Math.min(100, Math.round((1 - debtRemaining / initialDebt) * 100)));
  const reserveMonths = state.monthlyExpenses > 0 ? state.cash / state.monthlyExpenses : 0;
  const mainComplete = debtRemaining <= 0;
  const expired = elapsedDays >= challenge.durationDays;
  const succeeded = mainComplete && elapsedDays <= challenge.durationDays;
  const secondary = {
    reserve: reserveMonths >= challenge.reserveMonthsTarget,
    positiveCashflow: state.monthlyNetCashflow >= 0,
    noEmergencyCredit: !state.debts.some((debt) => debt.reason === "Ligne de crédit d'urgence"),
  };
  return { elapsedDays, daysRemaining, debtRemaining, initialDebt, debtProgressPct, reserveMonths, mainComplete, expired, succeeded, secondary };
}
