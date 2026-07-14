// Système de carrière : une vraie liste de compétences (pas une jauge unique),
// acquises au départ selon le métier, développées par la formation (PA +
// argent) ou par la pratique (missions freelance). Elles conditionnent le
// changement de poste (job board), avec une vraie incertitude à l'embauche —
// pas un simple clic. En miroir : un risque de surmenage si le joueur ne se
// repose jamais (tous ses PA dépensés jour après jour), qui peut coûter un
// emploi ou, si en couple, mener au divorce. Objectif : pas un simulateur de
// vie exhaustif, un levier de progression qui a un vrai coût d'opportunité.
import { uid } from "../../../utils/format.js";
import { PROFESSIONS } from "../../../data/professions.js";

const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

export function skillLevelLabel(level) {
  if (level >= 80) return "Expert·e";
  if (level >= 55) return "Confirmé·e";
  if (level >= 30) return "Compétent·e";
  if (level > 0) return "Débutant·e";
  return "Aucune";
}

// --- Formation : cible une compétence précise, coûte des PA/jour pendant sa
// durée (soustraits du budget quotidien), plus un coût comptant à l'inscription.
export const TRAININGS = [
  { key: "courte", label: "Formation courte", days: 5, paCost: 2, cashCost: 300, skillGain: 12 },
  { key: "intensive", label: "Formation intensive", days: 12, paCost: 4, cashCost: 900, skillGain: 30 },
];

export function startTraining(skillKey, trainingKey) {
  const t = TRAININGS.find((x) => x.key === trainingKey);
  if (!t) return null;
  return { skillKey, trainingKey, label: t.label, daysRemaining: t.days, totalDays: t.days, paCost: t.paCost, skillGain: t.skillGain };
}

// Décrémente la formation en cours de `numDays` jours (1 pour "Jour suivant",
// plusieurs pour "Sauter le mois" — la progression est linéaire, pas besoin
// de boucler jour par jour comme pour les événements d'actifs). Applique le
// gain sur la compétence ciblée dès que la période est terminée.
export function tickTraining(training, skills, numDays = 1) {
  if (!training) return { training: null, skills, completed: false };
  const daysRemaining = training.daysRemaining - numDays;
  if (daysRemaining <= 0) {
    const next = { ...skills, [training.skillKey]: clamp((skills[training.skillKey] || 0) + training.skillGain) };
    return { training: null, skills: next, completed: true };
  }
  return { training: { ...training, daysRemaining }, skills, completed: false };
}

// --- Job board : chaque poste (même roster que PROFESSIONS) exige un set de
// compétences à un seuil minimum (`jobRequirements`) — toutes doivent être
// atteintes pour pouvoir postuler.
export function jobRequirementsMet(skills, professionId) {
  const prof = PROFESSIONS.find((p) => p.id === professionId);
  if (!prof || !prof.jobRequirements) return true;
  return Object.entries(prof.jobRequirements).every(([key, min]) => (skills[key] || 0) >= min);
}

export const JOB_APPLY_PA_COST = 2;
export const JOB_REJECTION_COOLDOWN_DAYS = 5;

// Chance d'acceptation : de base 55%, +2%/point de compétence au-dessus du
// seuil minimum requis (moyenne sur les compétences demandées) — être
// qualifié ne suffit pas, être largement au-dessus des seuils aide.
export function applicationChance(skills, professionId) {
  const prof = PROFESSIONS.find((p) => p.id === professionId);
  if (!prof || !prof.jobRequirements) return 0.9;
  const entries = Object.entries(prof.jobRequirements);
  const avgExcess = entries.reduce((s, [key, min]) => s + Math.max(0, (skills[key] || 0) - min), 0) / entries.length;
  return Math.min(0.9, 0.55 + avgExcess * 0.02);
}

export function rollApplication(skills, professionId) {
  if (!jobRequirementsMet(skills, professionId)) return { accepted: false, qualified: false, chance: 0 };
  const chance = applicationChance(skills, professionId);
  return { accepted: Math.random() < chance, qualified: true, chance };
}

// --- Missions freelance : petites missions ponctuelles contre des PA,
// payées au comptant, liées chacune à une compétence — apprentissage par la
// pratique en plus (ou à la place) de la formation formelle.
const MISSION_TEMPLATES = [
  { title: "Mission de dépannage", paCost: 1, base: 8, skill: "technique" },
  { title: "Consultation express", paCost: 2, base: 14, skill: "analyse" },
  { title: "Rapport freelance", paCost: 2, base: 16, skill: "comptabilite" },
  { title: "Mission de conseil", paCost: 3, base: 22, skill: "vente" },
  { title: "Support client ponctuel", paCost: 1, base: 10, skill: "service_client" },
  { title: "Traduction / rédaction", paCost: 2, base: 15, skill: "communication" },
];

export function generateMissions(skills, count = 3) {
  const pool = [...MISSION_TEMPLATES].sort(() => Math.random() - 0.5).slice(0, count);
  return pool.map((m) => {
    const level = skills[m.skill] || 0;
    return {
      id: uid(), title: m.title, paCost: m.paCost, skill: m.skill,
      pay: Math.round((m.base + level * 1.6) * (0.85 + Math.random() * 0.3)),
    };
  });
}

export const MISSION_SKILL_GAIN_CHANCE = 0.25;
export const MISSION_SKILL_GAIN_RANGE = [1, 3];

export function completeMission(mission, skills) {
  let nextSkills = skills;
  let gained = 0;
  if (Math.random() < MISSION_SKILL_GAIN_CHANCE) {
    gained = MISSION_SKILL_GAIN_RANGE[0] + Math.floor(Math.random() * (MISSION_SKILL_GAIN_RANGE[1] - MISSION_SKILL_GAIN_RANGE[0] + 1));
    nextSkills = { ...skills, [mission.skill]: clamp((skills[mission.skill] || 0) + gained) };
  }
  return { skills: nextSkills, gained };
}

// --- Surmenage : un compteur de jours consécutifs où le joueur a dépensé la
// totalité de son budget quotidien de PA (formation, missions, gestion —
// jamais rien gardé pour souffler). Au-delà du seuil, risque croissant de
// burnout (perte d'emploi + frais) et, si en couple, de divorce.
export const REST_THRESHOLD_DAYS = 5;

export const BURNOUT_BASE_CHANCE = 0.08;
export const BURNOUT_CHANCE_STEP = 0.05;
export const BURNOUT_CHANCE_CAP = 0.6;
export const BURNOUT_LAYOFF_MONTHS = 2;
export const BURNOUT_COST_RANGE = [500, 1500];

export function rollBurnout(daysWithoutRest) {
  if (daysWithoutRest <= REST_THRESHOLD_DAYS) return false;
  const excess = daysWithoutRest - REST_THRESHOLD_DAYS;
  const chance = Math.min(BURNOUT_CHANCE_CAP, BURNOUT_BASE_CHANCE + excess * BURNOUT_CHANCE_STEP);
  return Math.random() < chance;
}

export function burnoutCost() {
  const [lo, hi] = BURNOUT_COST_RANGE;
  return lo + Math.round(Math.random() * (hi - lo));
}

export const DIVORCE_BASE_CHANCE = 0.03;
export const DIVORCE_CHANCE_STEP = 0.02;
export const DIVORCE_CHANCE_CAP = 0.35;
export const DIVORCE_CASH_PCT = 0.2;
export const DIVORCE_FLAT_COST = 400;

export function rollDivorce(daysWithoutRest) {
  if (daysWithoutRest <= REST_THRESHOLD_DAYS) return false;
  const excess = daysWithoutRest - REST_THRESHOLD_DAYS;
  const chance = Math.min(DIVORCE_CHANCE_CAP, DIVORCE_BASE_CHANCE + excess * DIVORCE_CHANCE_STEP);
  return Math.random() < chance;
}

export function divorceCost(cash) {
  return Math.round(cash * DIVORCE_CASH_PCT) + DIVORCE_FLAT_COST;
}
