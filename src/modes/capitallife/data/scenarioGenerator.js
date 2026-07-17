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

export const SCENARIO_PRESETS = [
  {
    key: "random",
    label: "Aléatoire",
    description: "Tirage classique, sans contrainte.",
    apply: null,
  },
  {
    key: "young_graduate",
    label: "Jeune diplômé endetté",
    description: "Peu de cash, gros prêt étudiant, salaire d'entrée de carrière.",
    apply: (draft) => {
      const reference = draft.profession.liabilities?.schoolLoan || draft.profession.salary * 12;
      return {
        ...draft,
        startingCash: Math.round(draft.startingCash * 0.4),
        liabilities: { ...draft.liabilities, schoolLoan: Math.max(draft.liabilities.schoolLoan || 0, Math.round(reference * 1.4)) },
      };
    },
  },
  {
    key: "single_parent",
    label: "Parent solo",
    description: "Démarre avec un enfant à charge et un budget serré.",
    apply: (draft) => ({ ...draft, startingKids: 1 }),
  },
  {
    key: "heir",
    label: "Héritier d'un bien dégradé",
    description: "Un bien immobilier de départ, mais en mauvais état et sans locataire.",
    apply: (draft) => ({ ...draft, startingAssetHint: "degraded_realestate" }),
  },
  {
    key: "recession_start",
    label: "Départ en récession",
    description: "La partie démarre avec un contexte économique dégradé.",
    apply: (draft) => ({ ...draft, startingEconomy: "recession" }),
  },
  {
    key: "debt_escape_24",
    label: "Sortir du piège",
    description: "Défi de 24 mois : dettes coûteuses, faible réserve et aucun actif au départ.",
    challengeOnly: true,
    apply: (draft) => ({
      ...draft,
      profession: PROFESSIONS.find((profession) => profession.id === "secretaire") || draft.profession,
      startingCash: Math.min(1200, draft.startingCash),
      liabilities: {
        mortgage: 0,
        carLoan: Math.max(4500, draft.liabilities.carLoan || 0),
        creditCard: Math.max(6500, draft.liabilities.creditCard || 0),
        schoolLoan: Math.max(3500, draft.liabilities.schoolLoan || 0),
      },
      debt: { ...draft.debt, reason: "Crédit consommation", monthlyPayment: 260, monthsRemaining: 36, totalMonths: 36, balance: 9360 },
      startingKids: 0,
      startingAssetHint: null,
    }),
  },
];

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
export function generateScenario(presetKey = "random") {
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
  const draft = { profession, startingCash, liabilities, debt, presetKey };
  const preset = SCENARIO_PRESETS.find((item) => item.key === presetKey) || SCENARIO_PRESETS[0];
  return preset.apply ? preset.apply({ ...draft, presetKey: preset.key }) : { ...draft, presetKey: preset.key };
}
