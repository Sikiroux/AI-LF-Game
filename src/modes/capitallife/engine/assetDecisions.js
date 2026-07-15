import { fmt } from "../../../utils/format.js";
import { ASSET_PROBLEM_COOLDOWN_DAYS } from "./assetEvents.js";
import { computeStability, runAd, totalSalaries } from "./assetIndicators.js";

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const neglect = (value) => clamp((100 - (value ?? 100)) / 100, 0, 1);
const hasRole = (asset, role) => (asset.employees || []).some((employee) => employee.role === role);

const DEFINITIONS = {
  machineBreakdown: {
    title: "Une machine essentielle est en panne",
    options: [
      { key: "repairNow", label: "Réparation immédiate", detail: "2 PA, coût élevé, activité rétablie tout de suite", paCost: 2 },
      { key: "repairCheap", label: "Réparation provisoire", detail: "Coût faible, risque de nouvelle panne sous 20 jours", paCost: 0 },
      { key: "rentEquipment", label: "Louer du matériel", detail: "Paiement temporaire, sans interruption d'activité", paCost: 0 },
      { key: "pause", label: "Suspendre l'activité", detail: "Aucun coût immédiat, revenu réduit plusieurs jours", paCost: 0 },
    ],
  },
  vacancy: {
    title: "Le logement est désormais vacant",
    options: [
      { key: "lowerRent", label: "Baisser le loyer", detail: "Relocation rapide, revenu durablement réduit", paCost: 1 },
      { key: "agency", label: "Passer par une agence", detail: "Coût modéré et relocation fiable", paCost: 0 },
      { key: "renovate", label: "Rénover avant de relouer", detail: "Coût élevé, meilleur loyer et meilleur locataire", paCost: 2 },
      { key: "wait", label: "Attendre", detail: "Aucun coût, mais plusieurs semaines sans loyer", paCost: 0 },
      { key: "seasonal", label: "Louer en saisonnier", detail: "Revenu potentiel élevé mais irrégulier", paCost: 1 },
      { key: "riskyTenant", label: "Accepter un dossier risqué", detail: "Loyer immédiat, risque d'impayé accru", paCost: 0 },
    ],
  },
  footfallDrop: {
    title: "La fréquentation est en baisse",
    options: [
      { key: "promotion", label: "Lancer une promotion", detail: "Effet rapide mais temporaire", paCost: 1 },
      { key: "advertising", label: "Faire de la publicité", detail: "Coûteux, améliore durablement la réputation", paCost: 2 },
      { key: "adjustHours", label: "Ajuster les horaires", detail: "Amélioration progressive sans dépense", paCost: 1 },
      { key: "temporaryLayoff", label: "Réduire temporairement l'équipe", detail: "Réduit les charges, détériore la confiance", paCost: 1 },
      { key: "useTreasury", label: "Mobiliser la trésorerie", detail: "Finance une relance immédiate", paCost: 0, requiresTreasury: true },
      { key: "nothing", label: "Ne rien faire", detail: "Aucun coût, baisse prolongée", paCost: 0 },
    ],
  },
  taxAudit: {
    title: "L'entreprise fait l'objet d'un contrôle fiscal",
    options: [
      { key: "payNow", label: "Payer immédiatement", detail: "Montant réduit et dossier clos", paCost: 0 },
      { key: "contest", label: "Contester", detail: "Décision différée, avec risque de majoration", paCost: 2 },
      { key: "installments", label: "Échelonner le paiement", detail: "Préserve la trésorerie, mais coûte davantage", paCost: 1 },
    ],
  },
};

export function rollAssetDecision(asset, day) {
  if (asset.lastProblemDay != null && day - asset.lastProblemDay < ASSET_PROBLEM_COOLDOWN_DAYS) return null;
  const candidates = [];
  if (asset.type === "realestate" && asset.tenant) {
    candidates.push({ type: "vacancy", probability: 0.0003 + neglect(asset.tenant.happiness) * 0.007 });
  }
  if (asset.type === "business" && asset.reputation != null) {
    const technicianFactor = hasRole(asset, "technicien") ? 0.7 : 1;
    const accountantFactor = hasRole(asset, "comptable") ? 0.65 : 1;
    candidates.push({ type: "machineBreakdown", probability: (0.0005 + neglect(asset.condition) * 0.011) * technicianFactor });
    candidates.push({ type: "footfallDrop", probability: 0.0004 + neglect(asset.reputation) * 0.009 });
    if ((asset.treasury || 0) > 0) candidates.push({ type: "taxAudit", probability: 0.0005 * accountantFactor });
  }
  for (const candidate of candidates) {
    if (Math.random() < candidate.probability) {
      const definition = DEFINITIONS[candidate.type];
      const options = definition.options.filter((option) => !option.requiresTreasury || (asset.treasury || 0) > 0).map(({ requiresTreasury, ...option }) => option);
      return { type: candidate.type, assetId: asset.id, title: definition.title, options };
    }
  }
  return null;
}

function withCashflow(asset, grossCashflow, patch = {}) {
  const next = { ...asset, ...patch, grossCashflow };
  next.cashflow = grossCashflow - (next.loanMonthly || 0) - totalSalaries(next);
  return { ...next, stability: computeStability(next) };
}

export function applyAssetDecisionOption(asset, decisionType, optionKey, day, currency) {
  const canonicalGross = asset.baseGrossCashflow ?? asset.grossCashflow ?? asset.cashflow ?? 0;
  const f = (amount) => fmt(amount, currency);
  const costRate = (rate) => Math.max(1, Math.round((asset.cost || canonicalGross * 12) * rate));
  let next = { ...asset, lastProblemDay: day };
  let cashDelta = 0;
  let title = "Décision appliquée";
  let detail = asset.name;

  if (decisionType === "machineBreakdown") {
    if (optionKey === "repairNow") { const cost = costRate(0.035); cashDelta = -cost; next = { ...next, condition: clamp((asset.condition ?? 60) + 25) }; title = "Machine réparée"; detail = `${asset.name} : -${f(cost)}, activité rétablie.`; }
    else if (optionKey === "repairCheap") { const cost = costRate(0.012); cashDelta = -cost; next = { ...next, condition: clamp((asset.condition ?? 60) + 8), provisionalRepairUntilDay: day + 20 }; title = "Réparation provisoire"; detail = `${asset.name} : -${f(cost)}, une nouvelle panne reste possible.`; }
    else if (optionKey === "rentEquipment") { const cost = costRate(0.018); cashDelta = -cost; next = { ...next, equipmentRentalUntilDay: day + 30 }; title = "Matériel loué"; detail = `${asset.name} : -${f(cost)} pour maintenir l'activité.`; }
    else if (optionKey === "pause") { next = withCashflow(next, Math.round(canonicalGross * 0.2), { incomeEffectExpiresDay: day + 12 }); title = "Activité suspendue"; detail = `${asset.name} : revenus fortement réduits pendant 12 jours.`; }
  } else if (decisionType === "vacancy") {
    let tenant = { reliability: 70, happiness: 70, tenureMonths: 0 };
    if (optionKey === "lowerRent") { const gross = Math.round(canonicalGross * 0.9); next = withCashflow(next, gross, { baseGrossCashflow: gross, tenant }); title = "Logement reloué"; detail = `${asset.name} : loyer réduit de 10 %.`; }
    else if (optionKey === "agency") { const cost = Math.max(1, Math.round(canonicalGross)); cashDelta = -cost; tenant = { reliability: 82, happiness: 76, tenureMonths: 0 }; next = withCashflow(next, canonicalGross, { tenant }); title = "Agence mandatée"; detail = `${asset.name} : reloué pour ${f(cost)} de frais.`; }
    else if (optionKey === "renovate") { const cost = costRate(0.1); cashDelta = -cost; const gross = Math.round(canonicalGross * 1.15); tenant = { reliability: 88, happiness: 85, tenureMonths: 0 }; next = withCashflow(next, 0, { baseGrossCashflow: gross, tenant, condition: clamp((asset.condition ?? 60) + 30), renovationUntilDay: day + 12, incomeEffectExpiresDay: day + 12 }); title = "Rénovation lancée"; detail = `${asset.name} : -${f(cost)}, remise en location dans 12 jours.`; }
    else if (optionKey === "wait") { next = withCashflow(next, 0, { incomeEffectExpiresDay: day + 35 }); title = "Prix maintenu"; detail = `${asset.name} : jusqu'à 35 jours sans loyer.`; }
    else if (optionKey === "seasonal") { const gross = Math.round(canonicalGross * 1.2); next = withCashflow(next, gross, { baseGrossCashflow: gross, seasonalRental: true, tenant: { reliability: 55, happiness: 65, tenureMonths: 0 } }); title = "Location saisonnière"; detail = `${asset.name} : potentiel de revenu supérieur, mais plus risqué.`; }
    else if (optionKey === "riskyTenant") { next = withCashflow(next, canonicalGross, { tenant: { reliability: 35, happiness: 62, tenureMonths: 0 } }); title = "Dossier accepté"; detail = `${asset.name} : loyer immédiat, fiabilité fragile.`; }
  } else if (decisionType === "footfallDrop") {
    if (optionKey === "promotion") { const cost = costRate(0.012); cashDelta = -cost; next = withCashflow(next, Math.round(canonicalGross * 0.9), { incomeEffectExpiresDay: day + 10 }); title = "Promotion lancée"; detail = `${asset.name} : -${f(cost)}, fréquentation partiellement rétablie.`; }
    else if (optionKey === "advertising") { const result = runAd(next, day); cashDelta = -result.cost; next = result.asset; title = "Campagne publicitaire"; detail = `${asset.name} : -${f(result.cost)}, réputation améliorée.`; }
    else if (optionKey === "adjustHours") { next = withCashflow(next, Math.round(canonicalGross * 0.75), { reputation: clamp((asset.reputation ?? 60) + 4), incomeEffectExpiresDay: day + 12 }); title = "Horaires ajustés"; detail = `${asset.name} : reprise progressive attendue.`; }
    else if (optionKey === "temporaryLayoff") { const employees = (asset.employees || []).map((employee) => ({ ...employee, trust: clamp((employee.trust ?? 60) - 15), motivation: clamp(employee.motivation - 8) })); next = withCashflow({ ...next, employees }, Math.round(canonicalGross * 0.7), { incomeEffectExpiresDay: day + 15 }); title = "Équipe réduite"; detail = `${asset.name} : charges contenues, confiance dégradée.`; }
    else if (optionKey === "useTreasury") { const spent = Math.min(asset.treasury || 0, costRate(0.03)); next = { ...next, treasury: (asset.treasury || 0) - spent, reputation: clamp((asset.reputation ?? 60) + 10) }; title = "Relance financée"; detail = `${asset.name} : ${f(spent)} prélevés sur la trésorerie.`; }
    else if (optionKey === "nothing") { next = withCashflow(next, Math.round(canonicalGross * 0.5), { incomeEffectExpiresDay: day + 25, reputation: clamp((asset.reputation ?? 60) - 8) }); title = "Baisse prolongée"; detail = `${asset.name} : revenus réduits pendant 25 jours.`; }
  } else if (decisionType === "taxAudit") {
    const base = Math.max(1, Math.round((asset.treasury || 0) * 0.25));
    if (optionKey === "payNow") { const paid = Math.round(base * 0.8); next = { ...next, treasury: Math.max(0, (asset.treasury || 0) - paid) }; title = "Contrôle fiscal réglé"; detail = `${asset.name} : ${f(paid)} payés depuis la trésorerie.`; }
    else if (optionKey === "contest") { next = { ...next, taxAuditDueDay: day + 20, pendingTaxAuditAmount: base, taxAuditContested: true }; title = "Contrôle contesté"; detail = `${asset.name} : réponse attendue sous 20 jours, avec risque de majoration.`; }
    else if (optionKey === "installments") { const total = Math.round(base * 1.15); const first = Math.ceil(total / 3); next = { ...next, treasury: Math.max(0, (asset.treasury || 0) - first), taxInstallmentAmount: first, taxInstallmentsRemaining: 2 }; title = "Paiement échelonné"; detail = `${asset.name} : premier versement de ${f(first)}.`; }
  }

  next = { ...next, stability: computeStability(next) };
  return { asset: next, cashDelta, event: { title, detail, tone: cashDelta < 0 || decisionType === "taxAudit" ? "bad" : "neutral" } };
}
