import { rand, uid } from "../../../utils/format.js";
import { SMALL_DEALS } from "../../../data/smallDeals.js";
import { BIG_DEALS } from "../../../data/bigDeals.js";
import { JACKPOT_DEALS } from "../../../data/jackpotDeals.js";

export const TARGET_LISTINGS = 5;
export const MIN_LISTINGS = 2;
export const MAX_LISTINGS = 8;
const NEW_LISTING_FILL_CHANCE = 0.65; // par emplacement vide, jusqu'à la cible

const DURATION_RANGES = { small: [2, 7], big: [5, 20], jackpot: [1, 5] };

const NORMAL_DEALS = [
  ...SMALL_DEALS.map((card) => ({ card, kind: "small" })),
  ...BIG_DEALS.map((card) => ({ card, kind: "big" })),
];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function affordableCost(card) {
  return card.downPayment != null ? card.downPayment : card.cost;
}

// Choisit une annonce en tenant compte de la richesse du joueur : environ 45%
// accessibles tout de suite, 30% qui demandent un effort d'épargne, le reste
// trop cher pour l'instant ou une occasion exceptionnelle rare — pour que le
// joueur voie aussi des objectifs à viser, pas seulement ce qu'il peut déjà payer.
// `urgentBonus` (0-~0.2) : plus il y a de vendeurs pressés (récession), plus
// la part d'annonces déjà abordables augmente — reflète des vendeurs prêts à
// brader plutôt qu'attendre, sans changer les prix des cartes elles-mêmes.
function pickListingSource(cash, urgentBonus = 0) {
  const r = Math.random();
  if (r < 0.05) return { card: rand(JACKPOT_DEALS), kind: "jackpot" };
  if (r < 0.50 + urgentBonus) {
    const affordable = NORMAL_DEALS.filter((d) => affordableCost(d.card) <= cash);
    if (affordable.length) return rand(affordable);
  } else if (r < 0.80) {
    const stretch = NORMAL_DEALS.filter((d) => {
      const c = affordableCost(d.card);
      return c > cash && c <= cash * 3;
    });
    if (stretch.length) return rand(stretch);
  }
  return rand(NORMAL_DEALS);
}

function draftListing(day, cash, urgentBonus = 0) {
  const { card, kind } = pickListingSource(cash, urgentBonus);
  const [lo, hi] = DURATION_RANGES[kind];
  return { id: uid(), card, kind, postedDay: day, expiresDay: day + randInt(lo, hi) };
}

// Fait avancer le site d'un jour : les annonces caduques disparaissent, de
// nouvelles peuvent apparaître pour se rapprocher de TARGET_LISTINGS (jamais
// moins de MIN_LISTINGS, jamais plus de MAX_LISTINGS).
export function advanceListings(listings, day, cash, urgentBonus = 0) {
  let next = listings.filter((l) => l.expiresDay > day);
  const emptySlots = Math.max(0, TARGET_LISTINGS - next.length);
  for (let i = 0; i < emptySlots; i++) {
    if (Math.random() < NEW_LISTING_FILL_CHANCE) next.push(draftListing(day, cash, urgentBonus));
  }
  while (next.length < MIN_LISTINGS) next.push(draftListing(day, cash, urgentBonus));
  if (next.length > MAX_LISTINGS) next = next.slice(0, MAX_LISTINGS);
  return next;
}
