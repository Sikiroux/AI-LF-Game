import { rand } from "../utils/format.js";

export const FAST_TRACK_SEQUENCE = [
  "cashflowday","business","business","dream","business","cashflowday",
  "business","taxaudit","business","business","cashflowday","business",
  "lawsuit","business","charity","business","cashflowday","divorce",
];

export const FAST_BUSINESS_NAMES = [
  "Franchise de restauration rapide","Laverie automatisée","Immeuble de bureaux",
  "Chaîne de lavage auto","Complexe locatif","Franchise de fitness",
  "Entrepôt logistique","Résidence senior","Parc de stockage","Hôtel-boutique",
  "Data center régional","Réseau de bornes de recharge",
];
export function drawFastDeal(fastIncome) {
  const cost = Math.round(Math.max(1000, fastIncome) * (3 + Math.random() * 5));
  const incomeGain = Math.round(cost * (0.08 + Math.random() * 0.07));
  return { title: rand(FAST_BUSINESS_NAMES), cost, incomeGain, desc: "Une entreprise voie rapide qui augmente votre revenu récurrent." };
}
