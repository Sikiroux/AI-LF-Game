// Moteur d'indicateurs cachés pour les actifs immobiliers/entreprises de Capital
// Life. Chaque actif possédé porte des sous-indicateurs (état, locataire ou
// personnel/réputation) qui dérivent lentement chaque mois ; leur agrégat
// (`stability`) sert de jauge de santé globale et alimentera les événements
// d'actifs (dégradation = risque accru) sans jamais être un pur tirage
// aléatoire plat. Les actions (immobilier / entreprises) uniquement — la
// Bourse et les placements "stock" du site d'opportunités restent en dehors
// de ce système, cf. discussion sur le moteur d'actifs unifié.
const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

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
    return {
      condition: 90 + Math.round(Math.random() * 10),
      reputation: 55 + Math.round(Math.random() * 30),
      staffMorale: 60 + Math.round(Math.random() * 30),
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
    const staffMorale = clamp(asset.staffMorale + Math.round((Math.random() - 0.5) * 6));
    return { ...asset, condition, reputation, staffMorale, stability: computeStability({ ...asset, condition, reputation, staffMorale }) };
  }
  return asset;
}
