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

// Information imparfaite : une annonce sur cinq environ cache un vice
// (bien/entreprise repris avec un état dégradé dès l'achat) invisible tant
// qu'elle n'a pas été inspectée — un chiffre de cash-flow correct ne dit pas
// tout sur l'état réel de ce qu'on achète.
export const FLAW_CHANCE = 0.22;
const ESTIMATE_NOISE = 0.22; // ±22% avant inspection

function draftListing(day, cash, urgentBonus = 0) {
  const { card, kind } = pickListingSource(cash, urgentBonus);
  const [lo, hi] = DURATION_RANGES[kind];
  const flawed = kind !== "jackpot" && card.type !== "stock" && Math.random() < FLAW_CHANCE;
  const apparentCashflow = Math.round(card.cashflow * (1 - ESTIMATE_NOISE + Math.random() * ESTIMATE_NOISE * 2));
  return {
    id: uid(), card, kind, postedDay: day, expiresDay: day + randInt(lo, hi),
    flawed, inspected: false, negotiated: false, apparentCashflow,
  };
}

// Acheteurs concurrents : chaque jour, les annonces déjà abordables (donc
// convoitées) ou exceptionnelles risquent de disparaître avant leur date
// d'expiration affichée — raflées par un autre acheteur. Une raison réelle
// de ne pas laisser traîner une bonne affaire.
const SNIPE_CHANCE_AFFORDABLE = 0.018;
const SNIPE_CHANCE_OTHER = 0.006;
const SNIPE_CHANCE_JACKPOT = 0.045;

// Fait avancer le site d'un jour : les annonces caduques disparaissent, de
// nouvelles peuvent apparaître pour se rapprocher de TARGET_LISTINGS (jamais
// moins de MIN_LISTINGS, jamais plus de MAX_LISTINGS). Retourne aussi le
// titre de la première annonce raflée par un concurrent ce jour-là, le cas
// échéant (pour un événement dans le journal).
export function advanceListings(listings, day, cash, urgentBonus = 0) {
  let sniped = null;
  let next = listings.filter((l) => {
    if (l.expiresDay <= day) return false;
    if (l.kind === "jackpot" && Math.random() < SNIPE_CHANCE_JACKPOT) { sniped = sniped || l.card.title; return false; }
    if (l.kind !== "jackpot") {
      const apport = l.card.downPayment != null ? l.card.downPayment : l.card.cost;
      const chance = cash >= apport ? SNIPE_CHANCE_AFFORDABLE : SNIPE_CHANCE_OTHER;
      if (Math.random() < chance) { sniped = sniped || l.card.title; return false; }
    }
    return true;
  });
  const emptySlots = Math.max(0, TARGET_LISTINGS - next.length);
  for (let i = 0; i < emptySlots; i++) {
    if (Math.random() < NEW_LISTING_FILL_CHANCE) next.push(draftListing(day, cash, urgentBonus));
  }
  while (next.length < MIN_LISTINGS) next.push(draftListing(day, cash, urgentBonus));
  if (next.length > MAX_LISTINGS) next = next.slice(0, MAX_LISTINGS);
  return { listings: next, sniped };
}
