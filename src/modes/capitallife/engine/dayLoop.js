import { fmt, randNoRepeat, uid } from "../../../utils/format.js";
import { MARKET_CARDS } from "../../../data/marketCards.js";
import { calcExpenses, calcPassiveIncome } from "../../../engine/financing.js";
import { tickMarketDays } from "../../../engine/bourse/market.js";
import { advanceListings } from "./opportunitySite.js";
import { driftAssetIndicators } from "./assetIndicators.js";
import {
  SMALL_DOODAD_CARDS, BIG_DOODAD_CARDS, BIG_DOODAD_TERM_MONTHS,
  incomeRatio, scaleDoodadAmount, buildDailyEventTable, rollDailyEvent,
} from "./dailyEvents.js";

function amortizeAssetsList(assetList) {
  return assetList.map((a) => {
    if (!a.amortizing || !(a.loanBalance > 0)) return a;
    const interestPortion = Math.round(a.loanBalance * (a.annualRate / 12));
    let principalPortion = a.loanMonthly - interestPortion;
    if (principalPortion < 0) principalPortion = 0;
    const newBalance = Math.max(0, a.loanBalance - principalPortion);
    if (newBalance <= 0) return { ...a, loanBalance: 0, loanAmount: 0, loanMonthly: 0, amortizing: false, cashflow: a.grossCashflow };
    return { ...a, loanBalance: newBalance };
  });
}

// Simule `numDays` jours à partir d'un instantané complet de l'état — fonction
// pure, ne touche à aucun state React. Utilisée aussi bien pour "Jour suivant"
// (numDays=1) que pour "Sauter le mois" (numDays=plusieurs), pour éviter le
// piège classique React de relire un état périmé en bouclant sur des setState.
//
// `quiet` (mode "mois calme") désactive uniquement le tirage d'événements de vie
// quotidiens — la Bourse et le site d'opportunités continuent toujours d'avancer.
// `refs` = { small, big, market } sont les refs React "dernière carte tirée"
// (objets mutables {current}), passées telles quelles pour éviter les répétitions
// consécutives, cohérent sur plusieurs jours simulés d'affilée.
export function simulateDays(state, numDays, { quiet = false, currency = "EUR", refs }) {
  let {
    day, cash, profession, debts, liabilities, kids, assets, listings,
    tokens, pendingArcs, sectorConditions, economicModifier, marketTurn, traderJournalActive,
    babyEnabled, layoffEnabled, layoffMonthsLeft,
    lastSmallDoodadDay, lastBigDoodadDay, lastBabyDay, lastLayoffDay, luckyUntilDay,
  } = state;

  const events = [];
  const journalEntries = [];

  for (let i = 0; i < numDays; i++) {
    const nd = day + 1;

    const tick = tickMarketDays({ tokens, pendingArcs, sectorConditions, economicModifier, marketTurn, traderJournalActive, economicEffectDuration: 10, economicEffectPermanent: false, assets, currency }, 1);
    tokens = tick.tokens; pendingArcs = tick.pendingArcs; sectorConditions = tick.sectorConditions;
    economicModifier = tick.economicModifier; marketTurn = tick.marketTurn;
    let cashDelta = tick.cashDelta;
    if (tick.journalEntries.length) journalEntries.push(...tick.journalEntries);

    listings = advanceListings(listings, nd, cash);

    if (!quiet) {
      const lucky = nd < luckyUntilDay;
      const table = buildDailyEventTable({ profession, day: nd, kids, babyEnabled, layoffEnabled, layoffMonthsLeft, lastSmallDoodadDay, lastBigDoodadDay, lastBabyDay, lastLayoffDay, lucky });
      const eventType = rollDailyEvent(table);

      if (eventType === "doodad_small") {
        const card = randNoRepeat(SMALL_DOODAD_CARDS, refs.small);
        const amount = scaleDoodadAmount(card.amount, incomeRatio(profession));
        cashDelta -= amount;
        lastSmallDoodadDay = nd;
        events.push({ title: "Imprévu", detail: `${card.title} : -${fmt(amount, currency)}`, tone: "bad" });
      } else if (eventType === "doodad_big") {
        const card = randNoRepeat(BIG_DOODAD_CARDS, refs.big);
        const ratio = incomeRatio(profession);
        const amount = scaleDoodadAmount(card.amount, ratio);
        const financed = scaleDoodadAmount(card.bankLoanAdd, ratio);
        const monthlyPayment = Math.max(1, Math.round(financed / BIG_DOODAD_TERM_MONTHS));
        cashDelta -= amount;
        debts = [...debts, { id: uid(), reason: card.title, monthlyPayment, monthsRemaining: BIG_DOODAD_TERM_MONTHS, totalMonths: BIG_DOODAD_TERM_MONTHS, balance: monthlyPayment * BIG_DOODAD_TERM_MONTHS }];
        lastBigDoodadDay = nd;
        events.push({ title: "Grosse dépense", detail: `${card.title} : -${fmt(amount, currency)} comptant + ${fmt(monthlyPayment, currency)}/mois pendant ${BIG_DOODAD_TERM_MONTHS} mois`, tone: "bad" });
      } else if (eventType === "market") {
        const card = randNoRepeat(MARKET_CARDS, refs.market);
        const matching = assets.filter((a) => a.type === card.assetType);
        if (matching.length === 0) {
          events.push({ title: "Marché", detail: `${card.title} — vous ne possédez rien de ce type, aucun effet.`, tone: "info" });
        } else if (card.effectType === "income") {
          assets = assets.map((a) => {
            if (a.type !== card.assetType) return a;
            const base = a.baseGrossCashflow != null ? a.baseGrossCashflow : (a.grossCashflow != null ? a.grossCashflow : a.cashflow);
            const newGross = Math.max(0, Math.round(base * card.mult));
            return { ...a, baseGrossCashflow: base, grossCashflow: newGross, cashflow: newGross - (a.loanMonthly || 0) };
          });
          const pct = Math.round((card.mult - 1) * 100);
          events.push({ title: "Marché", detail: `${card.title} — revenu mensuel ${pct >= 0 ? "+" : ""}${pct}% sur vos actifs concernés.`, tone: card.mult >= 1 ? "good" : "bad" });
        } else {
          events.push({ title: "Marché", detail: `${card.title} — affecte la valeur de revente de vos actifs concernés.`, tone: card.mult >= 1 ? "good" : "bad" });
        }
      } else if (eventType === "charity") {
        const donation = Math.round(profession.salary * 0.1);
        cashDelta -= donation;
        luckyUntilDay = nd + 30;
        events.push({ title: "Don effectué", detail: `-${fmt(donation, currency)}. Un peu plus de chance sur les 30 prochains jours.`, tone: "good" });
      } else if (eventType === "baby") {
        kids += 1;
        lastBabyDay = nd;
        events.push({ title: "Bébé", detail: `Félicitations ! +${fmt(profession.perChild, currency)} de dépenses par mois.`, tone: "bad" });
      } else if (eventType === "layoff") {
        layoffMonthsLeft = 2;
        lastLayoffDay = nd;
        events.push({ title: "Licencié", detail: "Vous perdez votre emploi. Pas de salaire pendant 2 mois.", tone: "bad" });
      }
    }

    let payday = 0;
    if ((nd - 1) % 30 === 0) {
      const debtMonthly = debts.reduce((s, deb) => s + deb.monthlyPayment, 0);
      const expenses = calcExpenses(profession, kids, debtMonthly, liabilities);
      const salary = layoffMonthsLeft > 0 ? 0 : profession.salary;
      const passiveIncome = calcPassiveIncome(assets);
      payday = salary + passiveIncome - expenses;
      debts = debts.map((deb) => {
        const monthsRemaining = deb.monthsRemaining - 1;
        if (monthsRemaining <= 0) return null;
        return { ...deb, monthsRemaining, balance: deb.monthlyPayment * monthsRemaining };
      }).filter(Boolean);
      if (layoffMonthsLeft > 0) layoffMonthsLeft = Math.max(0, layoffMonthsLeft - 1);
      assets = amortizeAssetsList(assets).map(driftAssetIndicators);
      events.push({ title: "Jour de paie", detail: `Salaire + revenus passifs - dépenses = ${payday >= 0 ? "+" : ""}${fmt(payday, currency)}`, tone: payday >= 0 ? "good" : "bad" });
    }

    cash = Math.max(0, cash + cashDelta + payday);
    day = nd;
  }

  return {
    day, cash, profession, debts, liabilities, kids, assets, listings,
    tokens, pendingArcs, sectorConditions, economicModifier, marketTurn, traderJournalActive,
    babyEnabled, layoffEnabled, layoffMonthsLeft,
    lastSmallDoodadDay, lastBigDoodadDay, lastBabyDay, lastLayoffDay, luckyUntilDay,
    events, journalEntries,
  };
}
