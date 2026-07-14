// Moteur d'indicateurs cachés pour les actifs immobiliers/entreprises de Capital
// Life. Chaque actif possédé porte des sous-indicateurs (état, locataire ou
// personnel/réputation) qui dérivent lentement chaque mois ; leur agrégat
// (`stability`) sert de jauge de santé globale et alimentera les événements
// d'actifs (dégradation = risque accru) sans jamais être un pur tirage
// aléatoire plat. Les actions (immobilier / entreprises) uniquement — la
// Bourse et les placements "stock" du site d'opportunités restent en dehors
// de ce système, cf. discussion sur le moteur d'actifs unifié.
import { uid } from "../../../utils/format.js";

const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

const FIRST_NAMES = ["Léa", "Hugo", "Chloé", "Nathan", "Emma", "Louis", "Camille", "Lucas", "Manon", "Adam", "Sarah", "Enzo", "Inès", "Tom", "Jade", "Noah", "Zoé", "Rayan", "Lina", "Mathis"];
const LAST_NAMES = ["Martin", "Bernard", "Dubois", "Thomas", "Robert", "Petit", "Durand", "Leroy", "Moreau", "Simon", "Laurent", "Lefebvre", "Michel", "Garcia", "David", "Bertrand", "Roux", "Vincent", "Fontaine", "Chevalier"];
function randomName() {
  return `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]}`;
}

export const MAX_EMPLOYEES = 5;

// Un employé n'a que 4 champs — le reste (risque d'incident, performance) est
// calculé, pas géré à la main (cf. discussion "pas 50 statistiques par employé").
export function generateCandidate(refSalary) {
  const competence = 35 + Math.round(Math.random() * 55);
  const motivation = 45 + Math.round(Math.random() * 45);
  const loyalty = 45 + Math.round(Math.random() * 40);
  const salary = Math.max(150, Math.round(refSalary * (0.6 + (competence / 100) * 0.8)));
  return { id: uid(), name: randomName(), competence, motivation, loyalty, salary };
}

export function totalSalaries(asset) {
  return (asset.employees || []).reduce((s, e) => s + e.salary, 0);
}

export function computeStaffMorale(employees) {
  if (!employees || employees.length === 0) return null;
  const avgMotivation = employees.reduce((s, e) => s + e.motivation, 0) / employees.length;
  const avgLoyalty = employees.reduce((s, e) => s + e.loyalty, 0) / employees.length;
  return clamp(Math.round(0.6 * avgMotivation + 0.4 * avgLoyalty));
}

export function hireEmployee(asset, candidate) {
  const employees = [...(asset.employees || []), candidate];
  const next = { ...asset, employees, staffMorale: computeStaffMorale(employees) };
  return { ...next, stability: computeStability(next) };
}

export function fireEmployee(asset, employeeId) {
  const employees = (asset.employees || []).filter((e) => e.id !== employeeId);
  const next = { ...asset, employees, staffMorale: computeStaffMorale(employees) };
  return { ...next, stability: computeStability(next) };
}

export function fireSeverance(employee) {
  return Math.round(employee.salary * 1);
}

export function trainingCost(employee) {
  return Math.round(employee.salary * 2.5);
}

export function trainEmployee(asset, employeeId) {
  const employees = (asset.employees || []).map((e) => (e.id === employeeId
    ? { ...e, competence: clamp(e.competence + 12 + Math.round(Math.random() * 8)), motivation: clamp(e.motivation + 8) }
    : e));
  const next = { ...asset, employees, staffMorale: computeStaffMorale(employees) };
  return { ...next, stability: computeStability(next) };
}

export function initAssetIndicators(card) {
  if (card.type === "realestate") {
    return {
      condition: 90 + Math.round(Math.random() * 10),
      tenant: {
        reliability: 60 + Math.round(Math.random() * 30),
        happiness: 60 + Math.round(Math.random() * 30),
        tenureMonths: 0,
      },
    };
  }
  if (card.type === "business") {
    const refSalary = Math.max(200, Math.round(card.cashflow * 0.18));
    const employees = Array.from({ length: 1 + Math.round(Math.random()) }, () => generateCandidate(refSalary));
    return {
      condition: 90 + Math.round(Math.random() * 10),
      reputation: 55 + Math.round(Math.random() * 30),
      employees,
      staffMorale: computeStaffMorale(employees),
    };
  }
  return null;
}

export function computeStability(asset) {
  if (asset.type === "realestate") {
    const { condition, tenant } = asset;
    if (condition == null || !tenant) return null;
    return Math.round(0.4 * condition + 0.3 * tenant.reliability + 0.3 * tenant.happiness);
  }
  if (asset.type === "business") {
    const { condition, reputation, staffMorale } = asset;
    if (condition == null || reputation == null || staffMorale == null) return null;
    return Math.round(0.4 * condition + 0.3 * reputation + 0.3 * staffMorale);
  }
  return null;
}

// Bandes qualitatives affichées au joueur — jamais le chiffre brut (cf. principe
// "pas de tableau de bord de jauges cachées" de la conception du moteur d'actifs).
export function qualitativeLabel(value) {
  if (value == null) return null;
  if (value >= 80) return "Excellent";
  if (value >= 60) return "Bon";
  if (value >= 40) return "Moyen";
  if (value >= 20) return "Fragile";
  return "Critique";
}

export const MAINTENANCE_COOLDOWN_DAYS = 24;
export const MAINTENANCE_COST_RATE = 0.02; // 2% de la valeur de l'actif

// Entretien préventif déclenché par le joueur : restaure l'état contre
// paiement, avec un cooldown pour que ça reste un vrai choix stratégique
// plutôt qu'un bouton à spammer pour neutraliser le risque de panne/problème.
export function canPerformMaintenance(asset, day, cash) {
  if (asset.condition == null) return { ok: false, reason: "Aucun entretien possible sur ce type d'actif." };
  if (asset.condition >= 95) return { ok: false, reason: "Déjà en excellent état." };
  if (asset.lastMaintenanceDay != null && day - asset.lastMaintenanceDay < MAINTENANCE_COOLDOWN_DAYS) {
    return { ok: false, reason: `Entretien déjà fait récemment (revenez dans ${MAINTENANCE_COOLDOWN_DAYS - (day - asset.lastMaintenanceDay)} jours).` };
  }
  const cost = Math.round(asset.cost * MAINTENANCE_COST_RATE);
  if (cash < cost) return { ok: false, reason: "Liquidités insuffisantes." };
  return { ok: true, cost };
}

export function performMaintenance(asset, day) {
  const cost = Math.round(asset.cost * MAINTENANCE_COST_RATE);
  const condition = clamp(asset.condition + 20 + Math.round(Math.random() * 10));
  const next = { ...asset, condition, lastMaintenanceDay: day };
  return { asset: { ...next, stability: computeStability(next) }, cost };
}

// Dérive lente une fois par mois (appelé au jour de paie).
export function driftAssetIndicators(asset) {
  if (asset.type === "realestate" && asset.condition != null && asset.tenant) {
    const condition = clamp(asset.condition - (1 + Math.round(Math.random() * 2)), 15, 100);
    const reliability = clamp(asset.tenant.reliability + Math.round((Math.random() - 0.5) * 6));
    const happiness = clamp(asset.tenant.happiness + Math.round((Math.random() - 0.5) * 6));
    const tenureMonths = asset.tenant.tenureMonths + 1;
    return { ...asset, condition, tenant: { reliability, happiness, tenureMonths }, stability: computeStability({ ...asset, condition, tenant: { reliability, happiness, tenureMonths } }) };
  }
  if (asset.type === "business" && asset.condition != null && asset.reputation != null) {
    const condition = clamp(asset.condition - (1 + Math.round(Math.random() * 2)), 15, 100);
    const reputation = clamp(asset.reputation + Math.round((Math.random() - 0.5) * 6));
    let employees = asset.employees;
    let staffMorale;
    if (employees && employees.length > 0) {
      employees = employees.map((e) => ({
        ...e,
        motivation: clamp(e.motivation + Math.round((Math.random() - 0.5) * 8)),
        loyalty: clamp(e.loyalty + Math.round((Math.random() - 0.5) * 4)),
      }));
      staffMorale = computeStaffMorale(employees);
    } else {
      staffMorale = clamp((asset.staffMorale != null ? asset.staffMorale : 60) + Math.round((Math.random() - 0.5) * 6));
    }
    const next = { ...asset, condition, reputation, staffMorale, employees };
    return { ...next, stability: computeStability(next) };
  }
  return asset;
}
