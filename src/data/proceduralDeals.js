import { SECTORS } from "./sectors.js";
import { REALISTIC_FINANCING, amortizedPayment } from "../engine/financing.js";
import { rand } from "../utils/format.js";
import { NAME_PREFIXES } from "../engine/bourse/tokenGenerator.js";

export const DEAL_TIER_WEIGHTS = [
  { name: "Piège", weight: 0.13, roi: [-10, 5] },
  { name: "Correcte", weight: 0.50, roi: [20, 40] },
  { name: "Bonne", weight: 0.29, roi: [45, 90] },
  { name: "Exceptionnelle", weight: 0.08, roi: [95, 150] },
];
export const DEAL_DESC_BY_TIER = {
  "Piège": "Le prix semble attractif, mais faites bien le calcul avant de signer.",
  "Correcte": "Un investissement raisonnable, ni exceptionnel ni mauvais.",
  "Bonne": "Une belle opportunité à ne pas laisser filer.",
  "Exceptionnelle": "Une occasion rare, presque trop belle pour être vraie.",
};
export const SMALL_RE_TITLES = ["Condo en ville", "Petite maison de banlieue", "Studio locatif", "Duplex modeste", "Appartement à louer", "Terrain avec bâti locatif", "Maison à retaper", "Pavillon avec jardin"];
export const SMALL_BIZ_TITLES = ["Kiosque de quartier", "Laverie automatique (part)", "Food-truck (part)", "Salon de coiffure établi", "Micro-brasserie (part)", "Atelier de réparation", "Franchise café (part)"];
export const BIG_RE_TITLES = ["Immeuble locatif", "Résidence étudiante", "Complexe d'appartements", "Immeuble de bureaux", "Centre commercial (part)", "4-plex", "8-plex", "Petit hôtel particulier"];
export const BIG_BIZ_TITLES = ["Franchise restaurant", "Entrepôt logistique", "Chaîne de laveries", "Franchise de fitness", "Ferme solaire (part)", "Flotte de véhicules de location", "Data center (part)", "Clinique privée (part)"];

export function pickDealTier() {
  const r = Math.random();
  let cum = 0;
  for (const t of DEAL_TIER_WEIGHTS) { cum += t.weight; if (r <= cum) return t; }
  return DEAL_TIER_WEIGHTS[DEAL_TIER_WEIGHTS.length - 1];
}
export function calibrateCashflow(cost, down, annualRate, years, roiPct) {
  const loan = cost - down;
  const monthlyPayment = amortizedPayment(loan, annualRate, years);
  const targetMonthlyNet = (down * (roiPct / 100)) / 12;
  return Math.round(targetMonthlyNet + monthlyPayment);
}
export function generateDeal(isBig) {
  const roll = Math.random();
  const type = roll < 0.3 ? "stock" : roll < 0.62 ? "realestate" : "business";
  const tier = pickDealTier();
  const roi = tier.roi[0] + Math.random() * (tier.roi[1] - tier.roi[0]);
  if (type === "stock") {
    const cost = Math.round(isBig ? 5000 + Math.random() * 10000 : 400 + Math.random() * 2100);
    const cashflow = Math.round((cost * (roi / 100)) / 12);
    const sector = rand(SECTORS.filter((s) => s !== "immobilier"));
    return { title: `${rand(["Actions", "Obligations", "Fonds"])} ${rand(NAME_PREFIXES)}`, type, sector, cost, cashflow, desc: "Un placement en actions, payé comptant." };
  }
  const cfg = REALISTIC_FINANCING[type];
  let cost, down;
  if (type === "realestate") {
    cost = Math.round(isBig ? 70000 + Math.random() * 280000 : 35000 + Math.random() * 30000);
    down = Math.round(isBig ? 10000 + Math.random() * 50000 : 2000 + Math.random() * 3000);
  } else {
    cost = Math.round(isBig ? 70000 + Math.random() * 430000 : 5000 + Math.random() * 20000);
    down = Math.round(isBig ? 15000 + Math.random() * 85000 : 1000 + Math.random() * 1800);
  }
  const cashflow = calibrateCashflow(cost, down, cfg.annualRate, cfg.years, roi);
  const sector = type === "realestate" ? "immobilier" : rand(SECTORS.filter((s) => s !== "immobilier"));
  const titlePool = type === "realestate" ? (isBig ? BIG_RE_TITLES : SMALL_RE_TITLES) : (isBig ? BIG_BIZ_TITLES : SMALL_BIZ_TITLES);
  return { title: rand(titlePool), type, sector, cost, downPayment: down, cashflow, desc: DEAL_DESC_BY_TIER[tier.name] };
}
export function generateDealDeck(count, isBig) {
  return Array.from({ length: count }, () => generateDeal(isBig));
}
