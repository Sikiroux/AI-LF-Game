import { PROFESSIONS } from "../../../data/professions.js";
import { rand, uid } from "../../../utils/format.js";

const DEBT_REASONS = [
  "Crédit voiture", "Prêt étudiant", "Rénovation de la cuisine", "Mobilier à crédit",
  "Voyage financé l'an dernier", "Électroménager à crédit", "Crédit consommation",
  "Réparations imprévues financées", "Emprunt pour le mariage", "Ordinateur/téléphone à crédit",
];

// Génère une mise en situation aléatoire : un métier tiré du pool existant, des
// liquidités de départ variables, et une dette en cours avec son échéancier —
// exactement comme si le joueur avait déjà une vie derrière lui en arrivant dans le mode.
export function generateScenario() {
  const profession = rand(PROFESSIONS);
  const startingCash = Math.round(profession.cash * (0.6 + Math.random() * 0.9));
  const monthlyPayment = Math.round(profession.salary * (0.04 + Math.random() * 0.12));
  const monthsRemaining = 6 + Math.floor(Math.random() * 30);
  const debt = {
    id: uid(),
    reason: rand(DEBT_REASONS),
    monthlyPayment,
    monthsRemaining,
    totalMonths: monthsRemaining,
    balance: monthlyPayment * monthsRemaining,
  };
  return { profession, startingCash, debt };
}
