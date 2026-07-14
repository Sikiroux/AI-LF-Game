// Choix du loyer / train de vie : un vrai dilemme plutôt qu'une ligne de
// dépense passive. Le coût est un % du salaire (pas un montant fixe) pour
// rester proportionné à travers les 8 métiers (2 800 à 12 800 €/mois) — et
// suit automatiquement une promotion ou un changement de poste. Un loyer plus
// confortable améliore le budget quotidien de Points d'Action (moins de
// fatigue, meilleur cadre de vie) ; un loyer trop modeste le réduit.
export const RENT_TIERS = [
  { key: "minimal", label: "Studio minimaliste", salaryPct: 0.10, paModifier: -2, moodLabel: "Spartiate" },
  { key: "standard", label: "Appartement standard", salaryPct: 0.20, paModifier: 0, moodLabel: "Correct" },
  { key: "comfortable", label: "Appartement confortable", salaryPct: 0.32, paModifier: 1, moodLabel: "Agréable" },
  { key: "luxury", label: "Maison spacieuse", salaryPct: 0.48, paModifier: 2, moodLabel: "Luxueux" },
];

export const DEFAULT_RENT_TIER = "standard";
export const MOVE_PA_COST = 3;

export function rentTierByKey(key) {
  return RENT_TIERS.find((t) => t.key === key) || RENT_TIERS.find((t) => t.key === DEFAULT_RENT_TIER);
}

export function rentCost(tierKey, salary) {
  return Math.round(salary * rentTierByKey(tierKey).salaryPct);
}

// Coût de déménagement : un mois du loyer visé, comptant, en plus des PA.
export function moveCost(tierKey, salary) {
  return rentCost(tierKey, salary);
}
