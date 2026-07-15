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
export const EMPLOYEE_ROLES = ["vendeur", "technicien", "marketing", "comptable", "manager"];

// Seuil de participation (%) à partir duquel la gestion du personnel
// (recruter/former/licencier) se débloque sur une entreprise détenue en
// parts (cf. bug "Laverie (part)" gérable comme une entreprise à 100%).
// Réglable par le joueur dans les Options (34/50/100), 50% par défaut.
export const MANAGEMENT_THRESHOLD_OPTIONS = [50, 100];
export const DEFAULT_MANAGEMENT_THRESHOLD_PCT = 50;

// En dessous du seuil, l'actif business se comporte comme un placement
// financier pur : cash-flow proportionnel à la part détenue, mais pas
// d'accès à la gestion du personnel.
export function canManage(asset, threshold = DEFAULT_MANAGEMENT_THRESHOLD_PCT) {
  if (asset.type !== "business") return true;
  return (asset.stakePct ?? 100) >= threshold;
}

// Un employé n'a que 4 champs — le reste (risque d'incident, performance) est
// calculé, pas géré à la main (cf. discussion "pas 50 statistiques par employé").
export function generateCandidate(refSalary) {
  const competence = 35 + Math.round(Math.random() * 55);
  const motivation = 45 + Math.round(Math.random() * 45);
  const loyalty = 45 + Math.round(Math.random() * 40);
  const salary = Math.max(150, Math.round(refSalary * (0.6 + (competence / 100) * 0.8)));
  const role = EMPLOYEE_ROLES[Math.floor(Math.random() * EMPLOYEE_ROLES.length)];
  const trust = 50 + Math.round(Math.random() * 30);
  return { id: uid(), name: randomName(), role, competence, motivation, loyalty, trust, salary };
}

export function employeeRoleEffects(asset) {
  const employees = asset.employees || [];
  const count = (role) => employees.filter((employee) => employee.role === role).length;
  return {
    revenueMultiplier: 1 + count("vendeur") * 0.04,
    breakdownRiskMultiplier: Math.max(0.45, 1 - count("technicien") * 0.3),
    taxAuditRiskMultiplier: Math.max(0.4, 1 - count("comptable") * 0.35),
    adEffectMultiplier: 1 + count("marketing") * 0.25,
    autoManageThreshold: count("manager") > 0 ? 70 : 60,
  };
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
  if (candidate.role === "manager" && (asset.employees || []).some((employee) => employee.role === "manager")) return asset;
  const employees = [...(asset.employees || []), candidate];
  const next = { ...asset, employees, staffMorale: computeStaffMorale(employees) };
  return { ...next, stability: computeStability(next) };
}

export function fireEmployee(asset, employeeId) {
  const employees = (asset.employees || []).filter((e) => e.id !== employeeId).map((employee) => ({
    ...employee,
    trust: clamp((employee.trust ?? 60) - 12),
    motivation: clamp(employee.motivation - 5),
  }));
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
    ? { ...e, competence: clamp(e.competence + 12 + Math.round(Math.random() * 8)), motivation: clamp(e.motivation + 8), trust: clamp((e.trust ?? 60) + 10) }
    : e));
  const next = { ...asset, employees, staffMorale: computeStaffMorale(employees) };
  return { ...next, stability: computeStability(next) };
}

export function initAssetIndicators(card, managementThreshold = DEFAULT_MANAGEMENT_THRESHOLD_PCT) {
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
    const stakePct = card.stakePct ?? 100;
    const base = {
      condition: 90 + Math.round(Math.random() * 10),
      reputation: 55 + Math.round(Math.random() * 30),
      stakePct,
      treasury: 0,
      autoManage: false,
    };
    // Participation minoritaire (achat "(part)") : placement financier pur
    // tant que le seuil de gestion n'est pas atteint, pas de personnel.
    if (stakePct < managementThreshold) {
      return { ...base, employees: [], staffMorale: null };
    }
    const refSalary = Math.max(200, Math.round(card.cashflow * 0.18));
    const employees = Array.from({ length: 1 + Math.round(Math.random()) }, () => generateCandidate(refSalary));
    return { ...base, employees, staffMorale: computeStaffMorale(employees) };
  }
  return null;
}

// Rachat de parts supplémentaires sur une entreprise déjà partiellement
// détenue : fait croître la participation, le coût cumulé et le cash-flow
// proportionnellement, et fait apparaître le personnel la première fois que
// le seuil de gestion est franchi (avant, aucun employé n'était généré).
export function applyStakePurchase(asset, { newPct, addedCost, addedGross, loanAmount = 0, loanMonthly = 0, annualRate = 0 }, managementThreshold = DEFAULT_MANAGEMENT_THRESHOLD_PCT) {
  const currentPct = asset.stakePct ?? 100;
  const baseGross = (asset.baseGrossCashflow ?? asset.grossCashflow ?? 0) + addedGross;
  let next = {
    ...asset,
    stakePct: newPct,
    cost: asset.cost + addedCost,
    loanAmount: (asset.loanAmount || 0) + loanAmount,
    loanBalance: (asset.loanBalance || 0) + loanAmount,
    loanMonthly: (asset.loanMonthly || 0) + loanMonthly,
    annualRate: loanAmount > 0 ? annualRate : asset.annualRate,
    grossCashflow: (asset.grossCashflow || 0) + addedGross,
    baseGrossCashflow: baseGross,
  };
  if (currentPct < managementThreshold && newPct >= managementThreshold && (!next.employees || next.employees.length === 0)) {
    const refSalary = Math.max(200, Math.round(baseGross * 0.18));
    const employees = Array.from({ length: 1 + Math.round(Math.random()) }, () => generateCandidate(refSalary));
    next = { ...next, employees, staffMorale: computeStaffMorale(employees) };
  }
  next.cashflow = next.grossCashflow - next.loanMonthly - totalSalaries(next);
  return { ...next, stability: computeStability(next) };
}

export function computeStability(asset) {
  if (asset.type === "realestate") {
    const { condition, tenant } = asset;
    if (condition == null || !tenant) return null;
    return Math.round(0.4 * condition + 0.3 * tenant.reliability + 0.3 * tenant.happiness);
  }
  if (asset.type === "business") {
    const { condition, reputation, staffMorale } = asset;
    if (condition == null || reputation == null) return null;
    if (staffMorale == null) return Math.round(0.55 * condition + 0.45 * reputation);
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

export const RENOVATION_COST_RATE = 0.1;
export const RENOVATION_DAYS = 12;

export function canRenovate(asset, day, cash) {
  if (asset.type !== "realestate") return { ok: false, reason: "Seul un bien immobilier peut être rénové." };
  if (asset.renovationUntilDay != null && day < asset.renovationUntilDay) return { ok: false, reason: "Une rénovation est déjà en cours." };
  const cost = Math.round(asset.cost * RENOVATION_COST_RATE);
  if (cash < cost) return { ok: false, reason: "Liquidités insuffisantes." };
  return { ok: true, cost };
}

export function renovate(asset, day) {
  const cost = Math.round(asset.cost * RENOVATION_COST_RATE);
  const baseGrossCashflow = Math.round((asset.baseGrossCashflow ?? asset.grossCashflow ?? 0) * 1.15);
  const next = {
    ...asset,
    condition: clamp((asset.condition ?? 60) + 30),
    baseGrossCashflow,
    grossCashflow: 0,
    cashflow: -(asset.loanMonthly || 0),
    renovationUntilDay: day + RENOVATION_DAYS,
    incomeEffectExpiresDay: day + RENOVATION_DAYS,
    nextTenantReliabilityBonus: 15,
  };
  return { asset: { ...next, stability: computeStability(next) }, cost };
}

export function generateTenantCandidates(asset, count = 3) {
  const profiles = [
    { profile: "Fiable", reliability: 88, happiness: 78, rentMultiplier: 0.92 },
    { profile: "Équilibré", reliability: 72, happiness: 72, rentMultiplier: 1 },
    { profile: "Rémunérateur", reliability: 48, happiness: 65, rentMultiplier: 1.12 },
  ];
  const bonus = asset.nextTenantReliabilityBonus || 0;
  return profiles.slice(0, Math.max(2, Math.min(3, count))).map((profile) => ({
    id: uid(),
    ...profile,
    name: randomName(),
    reliability: clamp(profile.reliability + bonus),
    proposedRent: Math.round((asset.baseGrossCashflow ?? asset.grossCashflow ?? 0) * profile.rentMultiplier),
  }));
}

export function pickTenant(asset, candidate) {
  const baseGrossCashflow = candidate.proposedRent;
  const tenant = { id: candidate.id, name: candidate.name, profile: candidate.profile, reliability: candidate.reliability, happiness: candidate.happiness, tenureMonths: 0 };
  const next = { ...asset, tenant, baseGrossCashflow, grossCashflow: baseGrossCashflow, nextTenantReliabilityBonus: 0 };
  next.cashflow = baseGrossCashflow - (next.loanMonthly || 0);
  return { ...next, stability: computeStability(next) };
}

export function canOpenSecondLocation(asset, cash) {
  if (asset.type !== "business") return { ok: false, reason: "Cette action est réservée aux entreprises." };
  if ((asset.stability ?? 0) < 70) return { ok: false, reason: "La stabilité doit être au moins bonne." };
  if ((asset.locationCount || 1) >= 2) return { ok: false, reason: "Un second établissement est déjà ouvert." };
  const cost = Math.round(asset.cost * 0.6);
  if (cash < cost) return { ok: false, reason: "Liquidités insuffisantes." };
  return { ok: true, cost };
}

export function openSecondLocation(asset, day) {
  const cost = Math.round(asset.cost * 0.6);
  const baseGrossCashflow = Math.round((asset.baseGrossCashflow ?? asset.grossCashflow ?? 0) * 1.9);
  const next = { ...asset, locationCount: 2, incidentRiskMultiplier: 2, baseGrossCashflow, grossCashflow: baseGrossCashflow, secondLocationOpenedDay: day };
  next.cashflow = baseGrossCashflow - (next.loanMonthly || 0) - totalSalaries(next);
  return { asset: { ...next, stability: computeStability(next) }, cost };
}

export function sellAsset(asset, marketConditions = {}) {
  const economicModifier = Number(marketConditions.economicModifier ?? 1);
  const sectorModifier = Number(marketConditions.sectorModifier ?? marketConditions.sectorConditions?.[asset.sector] ?? 1);
  const stabilityModifier = 0.75 + clamp(asset.stability ?? 60) / 200;
  const price = Math.max(0, Math.round(asset.cost * economicModifier * sectorModifier * stabilityModifier));
  return { price, loanBalance: asset.loanBalance || 0, proceeds: Math.max(0, price - (asset.loanBalance || 0)) };
}

export const AD_COOLDOWN_DAYS = 20;
export const AD_COST_RATE = 0.03; // 3% de la valeur de l'actif

// Campagne de publicité, business uniquement : booste la réputation contre
// paiement, avec un cooldown — un levier actif qui remonte le stability et
// donc la dérive de revenu (cf. performanceGrowthRate), en complément de la
// gestion passive (personnel, entretien).
export function canRunAd(asset, day, cash) {
  if (asset.type !== "business" || asset.reputation == null) return { ok: false, reason: "Aucune campagne possible sur ce type d'actif." };
  if (asset.reputation >= 95) return { ok: false, reason: "Déjà en excellente réputation." };
  if (asset.lastAdDay != null && day - asset.lastAdDay < AD_COOLDOWN_DAYS) {
    return { ok: false, reason: `Campagne déjà menée récemment (revenez dans ${AD_COOLDOWN_DAYS - (day - asset.lastAdDay)} jours).` };
  }
  const cost = Math.round(asset.cost * AD_COST_RATE);
  if (cash < cost) return { ok: false, reason: "Liquidités insuffisantes." };
  return { ok: true, cost };
}

export function runAd(asset, day) {
  const cost = Math.round(asset.cost * AD_COST_RATE);
  const effect = employeeRoleEffects(asset).adEffectMultiplier;
  const reputation = clamp(asset.reputation + Math.round((10 + Math.random() * 10) * effect));
  const next = { ...asset, reputation, lastAdDay: day };
  return { asset: { ...next, stability: computeStability(next) }, cost };
}

// Trésorerie d'entreprise : au jour de paie, une part du cash-flow net d'une
// entreprise reste dans les caisses de l'entreprise plutôt que de tomber
// automatiquement dans les liquidités du joueur — celui-ci doit ensuite se
// verser un dividende pour la rendre disponible (cf. "se verser des
// dividendes"). L'entitlement compté pour l'indépendance financière
// (calcPassiveIncome) reste lui inchangé : c'est un choix de gestion de la
// trésorerie, pas une réduction du revenu passif au sens du jeu.
export const BUSINESS_TREASURY_RETENTION_RATE = 0.4;

export function businessTreasuryRetention(asset) {
  if (asset.type !== "business" || !(asset.cashflow > 0)) return 0;
  return Math.round(asset.cashflow * BUSINESS_TREASURY_RETENTION_RATE);
}

export function payDividend(asset, amount) {
  const paid = Math.max(0, Math.min(amount, asset.treasury || 0));
  return { asset: { ...asset, treasury: (asset.treasury || 0) - paid }, paid };
}

// Gestion automatique ("pilote automatique") : quand activée sur une
// entreprise, l'entretien et la publicité se déclenchent tout seuls dès que
// possible (cooldown écoulé, indicateur sous 60) et sont financés par la
// trésorerie de l'entreprise elle-même — jamais par les liquidités
// personnelles du joueur. Pensé pour "Sauter le mois", où le joueur ne
// micro-gère pas sa boîte au jour le jour.
export function autoManageBusiness(asset, day) {
  if (asset.type !== "business" || !asset.autoManage) return { asset, actions: [] };
  let next = asset;
  const actions = [];

  const threshold = employeeRoleEffects(next).autoManageThreshold;
  if (next.condition < threshold && canPerformMaintenance(next, day, next.treasury || 0).ok) {
    const { asset: updated, cost } = performMaintenance(next, day);
    next = { ...updated, treasury: (next.treasury || 0) - cost };
    actions.push({ kind: "maintenance", cost });
  }
  if (next.reputation != null && next.reputation < threshold && canRunAd(next, day, next.treasury || 0).ok) {
    const { asset: updated, cost } = runAd(next, day);
    next = { ...updated, treasury: (next.treasury || 0) - cost };
    actions.push({ kind: "ad", cost });
  }
  return { asset: next, actions };
}

// Une entreprise bien gérée (stability élevée) devient plus rentable avec le
// temps ; négligée, elle périclite — indépendamment des événements ponctuels
// (pannes, bonnes nouvelles...) qui restent un système à part. C'est le
// mécanisme qui fait que "le travail de gestion rapporte" concrètement.
export function performanceGrowthRate(stability) {
  if (stability == null) return 0;
  if (stability >= 70) return 0.01 + ((Math.min(100, stability) - 70) / 30) * 0.02; // +1% à +3%/mois
  if (stability <= 40) return -0.01 - ((40 - Math.max(0, stability)) / 40) * 0.02; // -1% à -3%/mois
  return 0;
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
        trust: clamp((e.trust ?? 60) + Math.round((Math.random() - 0.55) * 5)),
      }));
      staffMorale = computeStaffMorale(employees);
    } else {
      staffMorale = clamp((asset.staffMorale != null ? asset.staffMorale : 60) + Math.round((Math.random() - 0.5) * 6));
    }
    let next = { ...asset, condition, reputation, staffMorale, employees };
    const stability = computeStability(next);
    const growthRate = performanceGrowthRate(stability);
    let baseGrossCashflow = asset.baseGrossCashflow ?? asset.grossCashflow ?? 0;
    if (growthRate !== 0) baseGrossCashflow = Math.max(0, Math.round(baseGrossCashflow * (1 + growthRate)));
    const hasTempEffect = asset.incomeEffectExpiresDay != null;
    const grossCashflow = hasTempEffect ? asset.grossCashflow : baseGrossCashflow;
    next = { ...next, baseGrossCashflow, grossCashflow };
    const roleBonus = Math.round(grossCashflow * (employeeRoleEffects(next).revenueMultiplier - 1));
    next.cashflow = grossCashflow + roleBonus - (asset.loanMonthly || 0) - totalSalaries(next);
    return { ...next, stability };
  }
  return asset;
}
