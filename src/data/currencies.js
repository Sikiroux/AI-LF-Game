export const CURRENCIES = {
  EUR: { symbol: "€", position: "after", label: "Euro" },
  USD: { symbol: "$", position: "before", label: "Dollar" },
  XPF: { symbol: "F", position: "after", label: "Franc Pacifique" },
  XAF: { symbol: "FCFA", position: "after", label: "Franc CFA (Gabon)" },
};
export const CURRENCY_ORDER = ["EUR", "USD", "XPF", "XAF"];
// Tous les montants du jeu sont définis en euros (devise de base).
// XPF et XAF sont indexés à taux fixe sur l'euro ; USD au taux de marché (juillet 2026).
export const RATES_FROM_EUR = { EUR: 1, USD: 1.14, XPF: 119.33, XAF: 655.96 };
