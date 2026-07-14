import { PROFESSIONS } from "../../../data/professions.js";
import { rand, uid } from "../../../utils/format.js";

const DEBT_REASONS = [
  "Crédit voiture", "Prêt étudiant", "Rénovation de la cuisine", "Mobilier à crédit",
  "Voyage financé l'an dernier", "Électroménager à crédit", "Crédit consommation",
  "Réparations imprévues financées", "Emprunt pour le mariage", "Ordinateur/téléphone à crédit",
];

// Dettes de départ propres à Capital Life : pas de prêt immobilier (le
// système de loyer joue ce rôle — racheter sa propre maison plus tard
// recréera un vrai prêt immobilier), et les dettes restantes sont
// probabilistes plutôt que garanties à chaque partie, pour des débuts plus
// variés et moins systématiquement chargés.
const LIABILITY_CHANCE = { carLoan: 0.6, creditCard: 0.65, schoolLoan: 0.55 };

export function randomizeCapitalLifeLiabilities(profession) {
  const ref = profession.liabilities || {};
  const out = { mortgage: 0, carLoan: 0, creditCard: 0, schoolLoan: 0 };
  for (const key of Object.keys(LIABILITY_CHANCE)) {
    const base = ref[key] || 0;
    if (base > 0 && Math.random() < LIABILITY_CHANCE[key]) {
      out[key] = Math.round(base * (0.7 + Math.random() * 0.6));
    }
  }
  return out;
}

// Génère une mise en situation aléatoire : un métier tiré du pool existant, des
// liquidités de départ variables, des dettes de départ (probabilistes, cf.
// randomizeCapitalLifeLiabilities) et une dette en cours avec son échéancier —
// exactement comme si le joueur avait déjà une vie derrière lui en arrivant dans
// le mode. Les dettes sont générées ici (pas au moment de "Commencer") pour que
// l'aperçu affiché au joueur corresponde exactement à ce qu'il obtient.
export function generateScenario() {
  const profession = rand(PROFESSIONS);
  const startingCash = Math.round(profession.cash * (0.6 + Math.random() * 0.9));
  const liabilities = randomizeCapitalLifeLiabilities(profession);
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
  return { profession, startingCash, liabilities, debt };
}
