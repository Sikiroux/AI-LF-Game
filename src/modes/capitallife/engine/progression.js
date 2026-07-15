// Paliers de progression — remplace le niveau basé sur le temps écoulé
// (`1 + mois/6`) par des jalons liés à ce que le joueur a réellement
// accompli. Évalués à chaque rendu, purement dérivés de l'état courant (rien
// à sauvegarder). Un palier reste acquis même si sa condition n'est plus
// strictement vraie plus tard (pas de rétrogradation) — géré par l'appelant
// en gardant le meilleur palier atteint si besoin, ici on retourne juste le
// palier le plus haut actuellement satisfait.
export const TIERS = [
  {
    key: "stabilisation", label: "Stabilisation",
    check: (ctx) => ctx.netCashflow >= 0 && ctx.cash >= ctx.expenses && ctx.topSkill >= 30,
  },
  {
    key: "investisseur_debutant", label: "Investisseur débutant",
    check: (ctx) => ctx.assets.length >= 1 && ctx.finPct >= 10,
  },
  {
    key: "gestionnaire", label: "Gestionnaire",
    check: (ctx) => ctx.assets.length >= 2 && ctx.totalEmployees >= 1,
  },
  {
    key: "entrepreneur", label: "Entrepreneur",
    check: (ctx) => ctx.assets.some((a) => a.type === "business" && a.cashflow > 0),
  },
  {
    key: "investisseur_confirme", label: "Investisseur confirmé",
    check: (ctx) => ctx.assets.length >= 4 && new Set(ctx.assets.map((a) => a.type)).size >= 2,
  },
  {
    key: "independance", label: "Indépendance financière",
    check: (ctx) => ctx.won,
  },
];

function buildContext({ assets, skills, cash, expenses, netCashflow, finPct, won }) {
  const topSkill = Object.values(skills || {}).reduce((m, v) => Math.max(m, v), 0);
  const totalEmployees = assets.reduce((s, a) => s + (a.employees ? a.employees.length : 0), 0);
  return { assets, cash, expenses, netCashflow, finPct, won, topSkill, totalEmployees };
}

// Retourne le palier le plus haut actuellement atteint (ou null si aucun).
export function computeTier(state) {
  const ctx = buildContext(state);
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (TIERS[i].check(ctx)) return TIERS[i];
  }
  return null;
}
