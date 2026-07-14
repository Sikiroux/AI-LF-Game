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

// Dérive lente une fois par mois (appelé au jour de paie). Pas encore de
// levier d'entretien/investissement pour contrer la baisse — ce sera ajouté
// avec les décisions de gestion (écran de détail par actif).
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
