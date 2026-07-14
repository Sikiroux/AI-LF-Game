export const REALISTIC_FINANCING = {
  stock: { minDownPct: 100, annualRate: 0, years: 0 },
  realestate: { minDownPct: 20, annualRate: 0.05, years: 20 },
  business: { minDownPct: 30, annualRate: 0.08, years: 7 },
};
export const SIMPLE_LOAN_YEARS = 15; // durée générique du mode simplifié
export const CASHFLOW_MODE_MULTIPLIER = 6; // rendement façon jeu de base (dramatisé, 24-150%/an)

// Mensualité classique (capital + intérêts), comme un vrai crédit amorti.
export function amortizedPayment(principal, annualRate, years) {
  if (principal <= 0) return 0;
  const r = annualRate / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return principal * r / (1 - Math.pow(1 + r, -n));
}

export function getYieldMultiplier(yieldMode, customYieldMultiplier) {
  if (yieldMode === "cashflow") return CASHFLOW_MODE_MULTIPLIER;
  if (yieldMode === "personnalise") return customYieldMultiplier;
  return 1; // réaliste
}

export function computeFinancing(card, financingMode, downPaymentPct, loanRateMult, yieldMode, customYieldMultiplier) {
  const rateMult = loanRateMult || 1;
  const grossCashflow = Math.round(card.cashflow * getYieldMultiplier(yieldMode, customYieldMultiplier));
  if (card.type === "stock") {
    return { downPayment: card.cost, loanAmount: 0, loanMonthly: 0, netCashflow: grossCashflow, grossCashflow, annualRate: 0 };
  }
  let downPayment, loanAmount, annualRate;
  if (financingMode === "realistic") {
    const cfg = REALISTIC_FINANCING[card.type];
    const cardDown = card.downPayment != null ? card.downPayment : Math.round(card.cost * (cfg.minDownPct / 100));
    const pctDown = Math.round(card.cost * (downPaymentPct / 100));
    downPayment = Math.max(cardDown, pctDown);
    loanAmount = card.cost - downPayment;
    annualRate = cfg.annualRate * rateMult;
  } else {
    downPayment = Math.round(card.cost * (downPaymentPct / 100));
    loanAmount = card.cost - downPayment;
    annualRate = LOAN_RATE * 12 * rateMult;
  }
  // Mensualité "intérêts seuls" : comme dans le vrai jeu, le solde ne diminue jamais tout seul.
  // On ne peut s'en défaire qu'en revendant le bien ou en remboursant le solde entier (voir "Mes actifs").
  const loanMonthly = Math.round(loanAmount * (annualRate / 12));
  return { downPayment, loanAmount, loanMonthly, netCashflow: grossCashflow - loanMonthly, grossCashflow, annualRate };
}

export const LOAN_RATE = 0.005; // mensualité = 0,5% du capital emprunté / mois (6%/an, taux moyen simplifié)
// (mode "réaliste" : voir REALISTIC_FINANCING plus bas pour un taux propre à chaque type d'actif)

export const MAX_DEBT_RATIO = 0.33; // taux d'endettement maximum usuel (33%)
export const BANK_LOAN_RATE = 0.10; // vrai "prêt bancaire" du jeu officiel : 10%/mois, remboursable par tranches
export const BANK_LOAN_UNIT = 1000; // emprunt/remboursement par tranches de 1000 (comme la règle officielle)

// Les 4 dettes de départ liées au métier (prêt immo/auto/carte de crédit/prêt
// étudiant) : un solde à rembourser en plus de la mensualité fixe déjà comptée
// dans profession.expenses.
export const LIABILITY_KEYS = ["mortgage", "carLoan", "creditCard", "schoolLoan"];
export const LIABILITY_LABELS = { mortgage: "Prêt immobilier", carLoan: "Prêt auto", creditCard: "Carte de crédit", schoolLoan: "Prêt étudiant" };

// Tire un solde de départ plausible autour de la valeur de référence du métier
// (±30%), pour que deux parties avec le même métier ne partent jamais avec
// exactement la même dette. Un métier qui n'a pas ce type de dette (valeur à 0)
// reste à 0.
export function randomizeLiabilities(profession) {
  const ref = profession.liabilities || {};
  const out = {};
  for (const key of LIABILITY_KEYS) {
    const base = ref[key] || 0;
    out[key] = base > 0 ? Math.round(base * (0.7 + Math.random() * 0.6)) : 0;
  }
  return out;
}

// `liabilities`, si fourni, est le solde restant dû de chaque dette de départ
// ({mortgage, carLoan, creditCard, schoolLoan}) : une fois soldée (valeur à 0),
// sa mensualité fixe cesse de compter. Sans ce paramètre, comportement inchangé
// (toutes les mensualités comptent, comme avant l'ajout du système de dettes).
function activeExpense(e, key, liabilities) {
  if (!liabilities) return e[key];
  return liabilities[key] > 0 ? e[key] : 0;
}

export function calcDebtPayments(profession, extraMonthly, assets, liabilities) {
  const e = profession.expenses;
  const assetLoans = assets.reduce((s, a) => s + (a.loanMonthly || 0), 0);
  return activeExpense(e, "mortgage", liabilities) + activeExpense(e, "carLoan", liabilities) + activeExpense(e, "creditCard", liabilities) + activeExpense(e, "schoolLoan", liabilities) + extraMonthly + assetLoans;
}

export function calcExpenses(profession, kids, extraMonthly, liabilities) {
  const e = profession.expenses;
  const debtExpenses = activeExpense(e, "mortgage", liabilities) + activeExpense(e, "carLoan", liabilities) + activeExpense(e, "creditCard", liabilities) + activeExpense(e, "schoolLoan", liabilities);
  return e.taxes + debtExpenses + e.other + kids * profession.perChild + extraMonthly;
}
export function calcPassiveIncome(assets) {
  return assets.reduce((s, a) => s + a.cashflow, 0);
}

export function maxAmortMonths(type) {
  return (type === "business" ? REALISTIC_FINANCING.business.years : REALISTIC_FINANCING.realestate.years) * 12;
}
