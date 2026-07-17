import { writeFileSync, mkdirSync } from "node:fs";
import { PROFESSIONS } from "../src/data/professions.js";
import { calcExpenses } from "../src/engine/financing.js";
import { amortizeCapitalLifeLiabilities } from "../src/modes/capitallife/engine/liabilities.js";
import { generateMissions } from "../src/modes/capitallife/engine/career.js";
import { rentCost } from "../src/modes/capitallife/engine/lifestyle.js";

const RUNS = Number(process.env.AUDIT_RUNS || 1000);
const MONTHS = Number(process.env.AUDIT_MONTHS || 24);
const DAYS_PER_MONTH = 30;
const LIABILITY_CHANCE = { carLoan: 0.6, creditCard: 0.65, schoolLoan: 0.55 };
const LIABILITY_KEYS = Object.keys(LIABILITY_CHANCE);

function rng(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function percentile(values, pct) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * pct))];
}

function startingState(profession, random) {
  const liabilities = { mortgage: 0, carLoan: 0, creditCard: 0, schoolLoan: 0 };
  for (const key of LIABILITY_KEYS) {
    const base = profession.liabilities?.[key] || 0;
    if (base > 0 && random() < LIABILITY_CHANCE[key]) liabilities[key] = Math.round(base * (0.7 + random() * 0.6));
  }
  const monthlyPayment = Math.round(profession.salary * (0.04 + random() * 0.12));
  const monthsRemaining = 6 + Math.floor(random() * 30);
  return {
    cash: Math.round(profession.cash * (0.6 + random() * 0.9)),
    liabilities,
    scenarioDebt: { balance: monthlyPayment * monthsRemaining, monthlyPayment, monthsRemaining },
    freelanceEarned: 0,
    debtFreeMonth: null,
  };
}

function totalDebt(state) {
  return Object.values(state.liabilities).reduce((sum, value) => sum + value, 0) + Math.max(0, state.scenarioDebt.balance);
}

function activeLiabilityPayments(profession, liabilities) {
  return LIABILITY_KEYS.reduce((sum, key) => sum + (liabilities[key] > 0 ? (profession.expenses[key] || 0) : 0), 0);
}

function payDebtLumpSums(state, reserveTarget) {
  let available = Math.max(0, state.cash - reserveTarget);
  const candidates = [
    ...LIABILITY_KEYS.filter((key) => state.liabilities[key] > 0).map((key) => ({ kind: "liability", key, balance: state.liabilities[key] })),
    ...(state.scenarioDebt.balance > 0 ? [{ kind: "scenario", balance: state.scenarioDebt.balance }] : []),
  ].sort((a, b) => a.balance - b.balance);

  for (const debt of candidates) {
    if (available < debt.balance) continue;
    state.cash -= debt.balance;
    available -= debt.balance;
    if (debt.kind === "liability") state.liabilities[debt.key] = 0;
    else state.scenarioDebt = { balance: 0, monthlyPayment: 0, monthsRemaining: 0 };
  }
}

function dailyFreelanceIncome(profession, random) {
  const previousRandom = Math.random;
  Math.random = random;
  try {
    return generateMissions(profession.startingSkills || {}, 3, 1).reduce((sum, mission) => sum + mission.pay, 0);
  } finally {
    Math.random = previousRandom;
  }
}

function simulate(profession, strategy, seed, fixedChallenge = false) {
  const random = rng(seed);
  const state = startingState(profession, random);
  if (fixedChallenge) {
    state.cash = 1200;
    state.liabilities = { mortgage: 0, carLoan: 4500, creditCard: 6500, schoolLoan: 3500 };
    state.scenarioDebt = { balance: 9360, monthlyPayment: 260, monthsRemaining: 36 };
  }
  const startingDebt = totalDebt(state);

  for (let month = 1; month <= MONTHS; month += 1) {
    let freelance = 0;
    if (strategy === "freelance_weekly") {
      for (let week = 0; week < Math.ceil(DAYS_PER_MONTH / 7); week += 1) freelance += dailyFreelanceIncome(profession, random);
    }

    const debtPayment = state.scenarioDebt.monthsRemaining > 0 ? state.scenarioDebt.monthlyPayment : 0;
    const expenses = calcExpenses(profession, 0, debtPayment, state.liabilities) + rentCost("standard", profession.salary);
    state.cash += profession.salary + freelance - expenses;
    state.freelanceEarned += freelance;

    if (state.scenarioDebt.monthsRemaining > 0) {
      state.scenarioDebt.monthsRemaining -= 1;
      state.scenarioDebt.balance = Math.max(0, state.scenarioDebt.monthlyPayment * state.scenarioDebt.monthsRemaining);
    }
    state.liabilities = amortizeCapitalLifeLiabilities(profession, state.liabilities);

    if (strategy === "debt_first" || strategy === "freelance_weekly") {
      const reserve = strategy === "debt_first" ? expenses : Math.round(expenses * 0.5);
      payDebtLumpSums(state, reserve);
    }

    if (state.debtFreeMonth == null && totalDebt(state) === 0) state.debtFreeMonth = month;
  }

  return {
    cash: state.cash,
    netWorth: state.cash - totalDebt(state),
    debt: totalDebt(state),
    startingDebt,
    debtFreeMonth: state.debtFreeMonth,
    freelanceEarned: state.freelanceEarned,
    bankrupt: state.cash < 0,
    persistentPayments: activeLiabilityPayments(profession, state.liabilities),
  };
}

function summarize(results) {
  const debtFree = results.filter((run) => run.debtFreeMonth != null);
  return {
    medianCash: Math.round(median(results.map((run) => run.cash))),
    medianNetWorth: Math.round(median(results.map((run) => run.netWorth))),
    medianDebt: Math.round(median(results.map((run) => run.debt))),
    p10NetWorth: Math.round(percentile(results.map((run) => run.netWorth), 0.1)),
    p90NetWorth: Math.round(percentile(results.map((run) => run.netWorth), 0.9)),
    debtFreeRate: debtFree.length / results.length,
    medianDebtFreeMonth: debtFree.length ? median(debtFree.map((run) => run.debtFreeMonth)) : null,
    bankruptRate: results.filter((run) => run.bankrupt).length / results.length,
    medianFreelanceEarned: Math.round(median(results.map((run) => run.freelanceEarned))),
    persistentPaymentRate: results.filter((run) => run.persistentPayments > 0).length / results.length,
  };
}

const strategies = ["passive_saver", "debt_first", "freelance_weekly"];
const report = { generatedAt: new Date().toISOString(), runsPerCase: RUNS, months: MONTHS, assumptions: [
  "Isole la boucle salaire/dépenses/dettes/missions, sans Bourse, OppMarket ni événements aléatoires.",
  "Les mensualités réduisent le capital après application du taux propre à chaque type de dette.",
  "Freelance hebdomadaire exécute les trois missions renouvelées chaque semaine.",
], professions: {} };

for (const profession of PROFESSIONS) {
  report.professions[profession.id] = {};
  for (const strategy of strategies) {
    const results = Array.from({ length: RUNS }, (_, index) => simulate(profession, strategy, 1000003 + index * 97 + profession.id.length * 7919));
    report.professions[profession.id][strategy] = summarize(results);
  }
}

const challengeProfession = PROFESSIONS.find((profession) => profession.id === "secretaire");
report.challenge = { id: "debt_escape_24", strategies: {} };
for (const strategy of strategies) {
  const results = Array.from({ length: RUNS }, (_, index) => simulate(challengeProfession, strategy, 7000001 + index * 131, true));
  report.challenge.strategies[strategy] = summarize(results);
}

const euros = (value) => `${Math.round(value).toLocaleString("fr-FR")} €`;
const pct = (value) => `${Math.round(value * 100)} %`;
const rows = PROFESSIONS.flatMap((profession) => strategies.map((strategy) => {
  const result = report.professions[profession.id][strategy];
  return `| ${profession.name} | ${strategy} | ${euros(result.medianNetWorth)} | ${euros(result.medianDebt)} | ${pct(result.debtFreeRate)} | ${result.medianDebtFreeMonth ?? "—"} | ${euros(result.medianFreelanceEarned)} |`;
}));
const challengeRows = strategies.map((strategy) => {
  const result = report.challenge.strategies[strategy];
  return `| ${strategy} | ${pct(result.debtFreeRate)} | ${result.medianDebtFreeMonth ?? "—"} | ${euros(result.medianDebt)} | ${euros(result.medianNetWorth)} |`;
});

const markdown = `# Audit d’équilibrage — Capital Life\n\nGénéré le ${new Date().toLocaleString("fr-FR")} avec ${RUNS.toLocaleString("fr-FR")} simulations par métier et stratégie, sur ${MONTHS} mois.\n\n## Périmètre\n\n${report.assumptions.map((item) => `- ${item}`).join("\n")}\n\n## Défi : Sortir du piège\n\n| Stratégie | Réussite | Mois médian | Dette finale | Patrimoine final |\n|---|---:|---:|---:|---:|\n${challengeRows.join("\n")}\n\n## Résultats généraux\n\n| Métier | Stratégie | Patrimoine médian | Dette médiane | Sans dette | Mois médian | Revenus freelance |\n|---|---|---:|---:|---:|---:|---:|\n${rows.join("\n")}\n\n## Lecture initiale\n\n- Une stratégie est suspecte si elle domine presque tous les métiers sans contrepartie de risque, de temps ou de compétence.\n- Les mensualités persistantes signalent les dettes dont la durée dépasse la fenêtre de 24 mois.\n- Le freelance hebdomadaire mesure le plafond provisoire du bouton de mission, avant la future simulation de contrats.\n`;

mkdirSync("reports", { recursive: true });
writeFileSync("reports/capital-life-balance.json", `${JSON.stringify(report, null, 2)}\n`);
writeFileSync("reports/capital-life-balance.md", markdown);
console.log(markdown);
