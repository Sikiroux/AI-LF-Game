// Cycle économique global — jusqu'ici la Bourse, le marché de l'emploi,
// l'immobilier et les entreprises évoluaient chacun dans leur coin, sans
// aucun fil conducteur commun. Un cycle unique, partagé par tous ces
// systèmes, rend le monde plus cohérent : une récession se ressent partout
// à la fois plutôt que comme des incidents isolés sans rapport.
export const ECONOMIC_CYCLES = ["expansion", "growth", "inflation", "slowdown", "recession", "recovery"];

export const CYCLE_LABELS = {
  expansion: "Expansion",
  growth: "Croissance",
  inflation: "Inflation",
  slowdown: "Ralentissement",
  recession: "Récession",
  recovery: "Reprise",
};

// Durée avant transition automatique vers le cycle suivant (progression
// naturelle dans l'ordre de ECONOMIC_CYCLES, en boucle) — pas de sauts
// aléatoires d'un état à l'autre, une économie ne bascule pas de l'expansion
// à la récession du jour au lendemain.
export const CYCLE_MIN_DAYS = 70;
export const CYCLE_MAX_DAYS = 130;

export function randomCycleDuration() {
  return CYCLE_MIN_DAYS + Math.floor(Math.random() * (CYCLE_MAX_DAYS - CYCLE_MIN_DAYS));
}

export function nextCycle(current) {
  const idx = ECONOMIC_CYCLES.indexOf(current);
  return ECONOMIC_CYCLES[(idx + 1) % ECONOMIC_CYCLES.length];
}

// Multiplicateurs consommés par les différents systèmes du jeu — un seul
// endroit pour ajuster l'ampleur de l'effet de chaque cycle plutôt que des
// constantes éparpillées.
const MODIFIERS = {
  expansion: { layoffMult: 0.6, missionPayMult: 1.1, businessGrowthMult: 1.3, loanRateMult: 1.05, urgentListingBonus: 0, jobOfferMult: 1.15 },
  growth: { layoffMult: 0.8, missionPayMult: 1.05, businessGrowthMult: 1.15, loanRateMult: 1.0, urgentListingBonus: 0, jobOfferMult: 1.05 },
  inflation: { layoffMult: 1.0, missionPayMult: 1.15, businessGrowthMult: 0.9, loanRateMult: 1.2, urgentListingBonus: 0.05, jobOfferMult: 0.95 },
  slowdown: { layoffMult: 1.3, missionPayMult: 0.95, businessGrowthMult: 0.75, loanRateMult: 1.15, urgentListingBonus: 0.1, jobOfferMult: 0.85 },
  recession: { layoffMult: 1.8, missionPayMult: 0.85, businessGrowthMult: 0.5, loanRateMult: 1.1, urgentListingBonus: 0.2, jobOfferMult: 0.65 },
  recovery: { layoffMult: 0.9, missionPayMult: 1.0, businessGrowthMult: 1.1, loanRateMult: 0.95, urgentListingBonus: 0.05, jobOfferMult: 1.1 },
};

export function cycleModifiers(cycle) {
  return MODIFIERS[cycle] || MODIFIERS.growth;
}
