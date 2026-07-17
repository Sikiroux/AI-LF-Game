import { LIABILITY_KEYS } from "../../../engine/financing.js";

// Règles propres à Capital Life. Le mode classique conserve intégralement son
// fonctionnement Cashflow et ne passe jamais par ce moteur d'amortissement.
export const CAPITAL_LIFE_LIABILITY_ANNUAL_RATES = {
  mortgage: 0.035,
  carLoan: 0.065,
  creditCard: 0.20,
  schoolLoan: 0.04,
};

export function amortizeCapitalLifeLiabilities(profession, liabilities) {
  if (!liabilities) return liabilities;
  const next = { ...liabilities };
  for (const key of LIABILITY_KEYS) {
    const balance = Number(next[key]) || 0;
    if (balance <= 0) continue;
    const interest = balance * ((CAPITAL_LIFE_LIABILITY_ANNUAL_RATES[key] || 0) / 12);
    next[key] = Math.max(0, Math.round(balance + interest - (profession.expenses[key] || 0)));
  }
  return next;
}
