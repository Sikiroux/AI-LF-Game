import { PROFESSIONS } from "../../../data/professions.js";
import { DOODAD_CARDS } from "../../../data/doodadCards.js";

// Revenu de référence = moyenne des salaires des métiers existants. Sert de point
// zéro pour mettre à l'échelle la fréquence/le montant des événements financiers.
export const REFERENCE_INCOME = Math.round(PROFESSIONS.reduce((s, p) => s + p.salary, 0) / PROFESSIONS.length);

export const SMALL_DOODAD_CARDS = DOODAD_CARDS.filter((c) => !c.bankLoanAdd);
export const BIG_DOODAD_CARDS = DOODAD_CARDS.filter((c) => c.bankLoanAdd);

export const BIG_DOODAD_TERM_MONTHS = 24;
export const SMALL_DOODAD_COOLDOWN_DAYS = 3;
export const BIG_DOODAD_COOLDOWN_DAYS = 30;
export const BABY_COOLDOWN_DAYS = 270;
export const LAYOFF_COOLDOWN_DAYS = 180;
export const LAYOFF_DURATION_MONTHS = 2;

function clamp(x, lo, hi) {
  return Math.max(lo, Math.min(hi, x));
}

// Ratio revenu du joueur / revenu de référence, borné pour éviter les extrêmes.
export function incomeRatio(profession) {
  return clamp(profession.salary / REFERENCE_INCOME, 0.6, 1.6);
}

export function scaleDoodadAmount(amount, ratio) {
  return Math.max(10, Math.round(amount * ratio));
}

// Construit la table de probabilités du jour, en excluant les catégories en
// cooldown ou désactivées dans les options. La chance appliquée est cumulative :
// rollDailyEvent tire un seul nombre et parcourt la table dans l'ordre.
export function buildDailyEventTable({ profession, day, kids, babyEnabled, layoffEnabled, layoffMonthsLeft, lastSmallDoodadDay, lastBigDoodadDay, lastBabyDay, lastLayoffDay, lucky, layoffMult = 1 }) {
  const ratio = incomeRatio(profession);
  const table = [];

  if (lastSmallDoodadDay == null || day - lastSmallDoodadDay >= SMALL_DOODAD_COOLDOWN_DAYS) {
    table.push({ type: "doodad_small", probability: 0.05 * ratio });
  }
  if (lastBigDoodadDay == null || day - lastBigDoodadDay >= BIG_DOODAD_COOLDOWN_DAYS) {
    const base = 0.015 * ratio * ratio;
    table.push({ type: "doodad_big", probability: lucky ? base / 2 : base });
  }
  table.push({ type: "market", probability: 0.05 });
  table.push({ type: "charity", probability: 0.02 });
  if (babyEnabled && kids < 3 && (lastBabyDay == null || day - lastBabyDay >= BABY_COOLDOWN_DAYS)) {
    table.push({ type: "baby", probability: 0.01 });
  }
  if (layoffEnabled && layoffMonthsLeft === 0 && (lastLayoffDay == null || day - lastLayoffDay >= LAYOFF_COOLDOWN_DAYS)) {
    table.push({ type: "layoff", probability: 0.003 * layoffMult });
  }
  return table;
}

export function rollDailyEvent(table) {
  const roll = Math.random();
  let cumulative = 0;
  for (const entry of table) {
    cumulative += entry.probability;
    if (roll < cumulative) return entry.type;
  }
  return null;
}
