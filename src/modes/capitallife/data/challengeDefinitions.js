export const CAPITAL_LIFE_CHALLENGES = {
  debt_escape_24: {
    id: "debt_escape_24",
    title: "Sortir du piège",
    description: "Remboursez toutes vos dettes avant l'échéance et reconstruisez une situation stable.",
    durationDays: 720,
    scenarioPresetKey: "debt_escape_24",
    reserveMonthsTarget: 1,
  },
};

export function challengeById(id) {
  return CAPITAL_LIFE_CHALLENGES[id] || null;
}
