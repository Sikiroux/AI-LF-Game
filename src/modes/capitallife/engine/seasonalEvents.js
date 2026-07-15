import { incomeRatio, scaleDoodadAmount } from "./dailyEvents.js";

// Calendrier abstrait du jeu : chaque "mois" dure 30 jours (cf. jour de paie),
// 12 mois forment une "année" de jeu — la partie démarre en Janvier de
// l'année 1. Sert à accrocher des événements saisonniers (rentrée, Noël...)
// à un mois précis plutôt qu'au numéro de mois absolu qui grandit sans fin.
export const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

export function calendarInfo(day) {
  const month = Math.floor((day - 1) / 30) + 1;
  const monthOfYear = ((month - 1) % 12) + 1;
  const year = Math.floor((month - 1) / 12) + 1;
  const dayOfMonth = ((day - 1) % 30) + 1;
  return { month, monthOfYear, year, dayOfMonth, monthName: MONTH_NAMES[monthOfYear - 1] };
}

// Cooldown large (> durée d'une "année" de jeu) pour qu'un événement saisonnier
// ne se déclenche qu'une fois par passage dans sa fenêtre, jamais deux fois de
// suite au sein de la même année.
const SEASONAL_COOLDOWN_DAYS = 300;

// La chance quotidienne grandit à mesure qu'on approche de la date phare de
// l'événement (jour 25 du mois pour Noël) plutôt que d'être un tirage plat sur
// toute la fenêtre — pour donner la sensation de "se rapprocher de Noël".
function buildupChance(dayOfMonth, peakDay, base, peak) {
  const distance = Math.abs(peakDay - dayOfMonth);
  const span = 15;
  const t = Math.max(0, 1 - distance / span);
  return base + (peak - base) * t;
}

export const SEASONAL_EVENTS = [
  {
    id: "rentree",
    title: "Rentrée",
    monthOfYear: 9,
    dayWindow: [1, 14],
    chance: () => 0.10,
    amount: (profession, kids) => {
      const ratio = incomeRatio(profession);
      const base = scaleDoodadAmount(120, ratio);
      const perKid = scaleDoodadAmount(90, ratio);
      return base + perKid * kids;
    },
    detail: (amount, kids, fmt) => kids > 0
      ? `Garde-robe et fournitures de rentrée pour ${kids} enfant${kids > 1 ? "s" : ""} : -${fmt(amount)}.`
      : `Garde-robe et affaires de rentrée : -${fmt(amount)}.`,
  },
  {
    id: "noel",
    title: "Noël",
    monthOfYear: 12,
    dayWindow: [10, 28],
    chance: (dayOfMonth) => buildupChance(dayOfMonth, 25, 0.02, 0.18),
    amount: (profession, kids) => {
      const ratio = incomeRatio(profession);
      const base = scaleDoodadAmount(180, ratio);
      const perKid = scaleDoodadAmount(70, ratio);
      return base + perKid * kids;
    },
    detail: (amount, kids, fmt) => `Cadeaux et repas de fête pour Noël : -${fmt(amount)}.`,
  },
];

// Tire au plus un événement saisonnier pour le jour donné (aucun cumul avec
// les imprévus/marché déjà gérés par dailyEvents.js — ce sont deux tirages
// indépendants, un événement saisonnier ne prend jamais la place d'un autre).
export function rollSeasonalEvent({ day, profession, kids, lastSeasonalDays, currency, fmt }) {
  const { monthOfYear, dayOfMonth } = calendarInfo(day);
  for (const def of SEASONAL_EVENTS) {
    if (def.monthOfYear !== monthOfYear) continue;
    const [start, end] = def.dayWindow;
    if (dayOfMonth < start || dayOfMonth > end) continue;
    const lastDay = lastSeasonalDays[def.id];
    if (lastDay != null && day - lastDay < SEASONAL_COOLDOWN_DAYS) continue;
    if (Math.random() >= def.chance(dayOfMonth)) continue;
    const amount = def.amount(profession, kids);
    return {
      id: def.id,
      amount,
      event: { title: def.title, detail: def.detail(amount, kids, (n) => fmt(n, currency)), tone: "bad" },
    };
  }
  return null;
}
