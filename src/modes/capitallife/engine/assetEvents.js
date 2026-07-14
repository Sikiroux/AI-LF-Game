import { fmt } from "../../../utils/format.js";
import { rollDailyEvent } from "./dailyEvents.js";

// Événements aléatoires liés aux actifs possédés (immobilier / entreprises
// rachetées), branchés sur les indicateurs cachés d'assetIndicators.js. La
// probabilité de chaque type augmente avec la négligence de l'indicateur
// concerné plutôt que d'être un pur tirage plat — un bien bien entretenu a
// un risque de panne proche de zéro, un bien laissé à l'abandon un risque
// élevé. Un cooldown par actif évite les problèmes en rafale sur le même bien.
// Doit toujours dépasser la durée maximale possible d'un effet temporaire
// (vacance locative : jusqu'à 44 jours) — sinon un nouvel événement peut se
// déclencher pendant qu'un effet précédent est encore actif et écraser sa
// restauration (baseGrossCashflow corrompu de façon permanente).
export const ASSET_PROBLEM_COOLDOWN_DAYS = 48;

function clamp(x, lo = 0, hi = 100) { return Math.max(lo, Math.min(hi, x)); }
// 0 (indicateur au max, aucune négligence) -> 1 (indicateur à 0, négligence totale).
function neglect(indicator) { return clamp((100 - (indicator ?? 100)) / 100, 0, 1); }

export function buildAssetEventTable(asset, day) {
  if (asset.lastProblemDay != null && day - asset.lastProblemDay < ASSET_PROBLEM_COOLDOWN_DAYS) return [];
  const table = [];
  if (asset.type === "realestate" && asset.tenant) {
    table.push({ type: "repair", probability: 0.0005 + neglect(asset.condition) * 0.011 });
    table.push({ type: "unpaidRent", probability: 0.0004 + neglect(asset.tenant.reliability) * 0.009 });
    table.push({ type: "vacancy", probability: 0.0003 + neglect(asset.tenant.happiness) * 0.007 });
    table.push({ type: "goodNews", probability: 0.0012 });
  } else if (asset.type === "business" && asset.reputation != null) {
    table.push({ type: "repair", probability: 0.0005 + neglect(asset.condition) * 0.011 });
    table.push({ type: "footfallDrop", probability: 0.0004 + neglect(asset.reputation) * 0.009 });
    table.push({ type: "goodNews", probability: 0.0012 });
  }
  return table;
}

export function rollAssetEvent(asset, day) {
  const table = buildAssetEventTable(asset, day);
  if (table.length === 0) return null;
  return rollDailyEvent(table);
}

// Applique le type d'événement tiré : renvoie l'actif mis à jour, un delta de
// liquidités ponctuel (0 si l'effet est seulement sur le cash-flow futur) et
// le texte d'événement à afficher.
export function applyAssetEvent(asset, type, day, currency) {
  const isRealestate = asset.type === "realestate";
  // Effet courant (peut être temporairement réduit par un événement en cours) —
  // sert uniquement aux montants ponctuels (ex. un mois de loyer impayé).
  const currentGross = asset.grossCashflow != null ? asset.grossCashflow : asset.cashflow;
  // Référence "canonique" hors tout effet temporaire — c'est la même que lit/écrit
  // l'effet permanent du marché (dayLoop.js). Ne jamais l'écraser avec une valeur
  // déjà réduite, sinon la restauration d'un futur effet temporaire se ferait sur
  // une base corrompue.
  const canonicalGross = asset.baseGrossCashflow != null ? asset.baseGrossCashflow : currentGross;
  const f = (n) => fmt(n, currency);

  if (type === "repair") {
    const cost = Math.round(asset.cost * (0.01 + Math.random() * 0.03));
    const condition = clamp((asset.condition != null ? asset.condition : 60) + 25 + Math.round(Math.random() * 15));
    return {
      asset: { ...asset, condition, lastProblemDay: day },
      cashDelta: -cost,
      event: { title: isRealestate ? "Réparation imprévue" : "Panne d'équipement", detail: `${asset.name} : -${f(cost)} de réparation.`, tone: "bad" },
    };
  }
  if (type === "unpaidRent") {
    return {
      asset: { ...asset, tenant: { ...asset.tenant, reliability: clamp(asset.tenant.reliability - 10) }, lastProblemDay: day },
      cashDelta: -currentGross,
      event: { title: "Loyer impayé", detail: `${asset.name} : le locataire n'a pas payé, -${f(currentGross)}.`, tone: "bad" },
    };
  }
  if (type === "vacancy") {
    const days = 20 + Math.floor(Math.random() * 25);
    return {
      asset: {
        ...asset, grossCashflow: 0, cashflow: -(asset.loanMonthly || 0),
        incomeEffectExpiresDay: day + days, lastProblemDay: day,
        tenant: { reliability: 55 + Math.round(Math.random() * 30), happiness: 55 + Math.round(Math.random() * 30), tenureMonths: 0 },
      },
      cashDelta: 0,
      event: { title: "Vacance locative", detail: `${asset.name} : locataire parti, ${days} jours sans loyer le temps d'en retrouver un.`, tone: "bad" },
    };
  }
  if (type === "footfallDrop") {
    const days = 15 + Math.floor(Math.random() * 20);
    const mult = 0.4 + Math.random() * 0.2;
    const newGross = Math.round(canonicalGross * mult);
    return {
      asset: {
        ...asset, grossCashflow: newGross, cashflow: newGross - (asset.loanMonthly || 0),
        incomeEffectExpiresDay: day + days, reputation: clamp(asset.reputation - 8), lastProblemDay: day,
      },
      cashDelta: 0,
      event: { title: "Baisse de fréquentation", detail: `${asset.name} : revenu réduit pendant ${days} jours.`, tone: "bad" },
    };
  }
  if (type === "goodNews") {
    const pct = 6 + Math.round(Math.random() * 10);
    const newGross = Math.round(canonicalGross * (1 + pct / 100));
    const patch = isRealestate
      ? { tenant: { ...asset.tenant, happiness: clamp(asset.tenant.happiness + 10) } }
      : { reputation: clamp(asset.reputation + 8) };
    // Événement permanent : si un effet temporaire est en cours, on ne l'écrase
    // pas ici (il continuera puis restaurera vers la nouvelle base canonique).
    const applyNow = asset.incomeEffectExpiresDay == null;
    return {
      asset: {
        ...asset, ...patch, baseGrossCashflow: newGross, lastProblemDay: day,
        ...(applyNow ? { grossCashflow: newGross, cashflow: newGross - (asset.loanMonthly || 0) } : {}),
      },
      cashDelta: 0,
      event: { title: isRealestate ? "Renégociation de loyer" : "Hausse de la demande", detail: `${asset.name} : revenu +${pct}%/mois, durablement.`, tone: "good" },
    };
  }
  return { asset, cashDelta: 0, event: null };
}
