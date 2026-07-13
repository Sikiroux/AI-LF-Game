import { useState, useEffect, useRef } from "react";
import { storage } from "../../../state/storage.js";
import { calcExpenses } from "../../../engine/financing.js";
import { generateTokens } from "../../../engine/bourse/tokenGenerator.js";
import { BROKERAGE_FEE_RATE, tickMarketDays } from "../../../engine/bourse/market.js";
import { fmt, randNoRepeat } from "../../../utils/format.js";
import { MARKET_CARDS } from "../../../data/marketCards.js";
import { generateScenario } from "../data/scenarioGenerator.js";
import {
  SMALL_DOODAD_CARDS, BIG_DOODAD_CARDS, BIG_DOODAD_TERM_MONTHS,
  incomeRatio, scaleDoodadAmount, buildDailyEventTable, rollDailyEvent,
} from "../engine/dailyEvents.js";

const SAVE_KEY = "ratrace2-save";
const CURRENCY = "EUR"; // le choix de devise par mode arrive avec les Options par mode

export default function useRatRace2State() {
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState("menu"); // menu | scenario | game | trading
  const [scenarioDraft, setScenarioDraft] = useState(null);
  const [profession, setProfession] = useState(null);
  const [day, setDay] = useState(0);
  const [cash, setCash] = useState(0);
  const [debts, setDebts] = useState([]);
  const [kids, setKids] = useState(0);
  const [assets, setAssets] = useState([]);
  const [lastEvent, setLastEvent] = useState(null);

  const [babyEnabled, setBabyEnabled] = useState(true);
  const [layoffEnabled, setLayoffEnabled] = useState(true);
  const [layoffMonthsLeft, setLayoffMonthsLeft] = useState(0);
  const [lastSmallDoodadDay, setLastSmallDoodadDay] = useState(null);
  const [lastBigDoodadDay, setLastBigDoodadDay] = useState(null);
  const [lastBabyDay, setLastBabyDay] = useState(null);
  const [lastLayoffDay, setLastLayoffDay] = useState(null);
  const [luckyUntilDay, setLuckyUntilDay] = useState(0);

  const [tokens, setTokens] = useState(() => generateTokens(16));
  const [portfolio, setPortfolio] = useState({});
  const [journal, setJournal] = useState([]);
  const [pendingArcs, setPendingArcs] = useState([]);
  const [sectorConditions, setSectorConditions] = useState({});
  const [economicModifier, setEconomicModifier] = useState({ loanRateMult: 1, expiresTurn: 0 });
  const [traderJournalActive, setTraderJournalActive] = useState(false);
  const [marketTurn, setMarketTurn] = useState(0);

  const lastSmallDoodadCardRef = useRef(null);
  const lastBigDoodadCardRef = useRef(null);
  const lastMarketCardRef = useRef(null);
  const f = (n) => fmt(n, CURRENCY);

  useEffect(() => {
    (async () => {
      try {
        const res = await storage.get(SAVE_KEY);
        if (res && res.value) {
          const s = JSON.parse(res.value);
          if (s.day) setDay(s.day);
          if (s.cash != null) setCash(s.cash);
          if (s.profession) setProfession(s.profession);
          if (Array.isArray(s.debts)) setDebts(s.debts);
          if (s.kids != null) setKids(s.kids);
          if (Array.isArray(s.assets)) setAssets(s.assets);
          if (s.babyEnabled !== undefined) setBabyEnabled(s.babyEnabled);
          if (s.layoffEnabled !== undefined) setLayoffEnabled(s.layoffEnabled);
          if (s.layoffMonthsLeft != null) setLayoffMonthsLeft(s.layoffMonthsLeft);
          if (s.lastSmallDoodadDay !== undefined) setLastSmallDoodadDay(s.lastSmallDoodadDay);
          if (s.lastBigDoodadDay !== undefined) setLastBigDoodadDay(s.lastBigDoodadDay);
          if (s.lastBabyDay !== undefined) setLastBabyDay(s.lastBabyDay);
          if (s.lastLayoffDay !== undefined) setLastLayoffDay(s.lastLayoffDay);
          if (s.luckyUntilDay != null) setLuckyUntilDay(s.luckyUntilDay);
          if (Array.isArray(s.tokens) && s.tokens.length) setTokens(s.tokens);
          if (s.portfolio) setPortfolio(s.portfolio);
          if (Array.isArray(s.journal)) setJournal(s.journal);
          if (Array.isArray(s.pendingArcs)) setPendingArcs(s.pendingArcs);
          if (s.sectorConditions) setSectorConditions(s.sectorConditions);
          if (s.economicModifier) setEconomicModifier(s.economicModifier);
          if (s.traderJournalActive !== undefined) setTraderJournalActive(s.traderJournalActive);
          if (s.marketTurn !== undefined) setMarketTurn(s.marketTurn);
        }
      } catch (e) { /* pas de sauvegarde existante */ }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded || day === 0) return;
    const s = {
      day, cash, profession, debts, kids, assets, babyEnabled, layoffEnabled, layoffMonthsLeft,
      lastSmallDoodadDay, lastBigDoodadDay, lastBabyDay, lastLayoffDay, luckyUntilDay,
      tokens, portfolio, journal, pendingArcs, sectorConditions, economicModifier, traderJournalActive, marketTurn,
    };
    storage.set(SAVE_KEY, JSON.stringify(s)).catch(() => {});
  }, [loaded, day, cash, profession, debts, kids, assets, babyEnabled, layoffEnabled, layoffMonthsLeft, lastSmallDoodadDay, lastBigDoodadDay, lastBabyDay, lastLayoffDay, luckyUntilDay, tokens, portfolio, journal, pendingArcs, sectorConditions, economicModifier, traderJournalActive, marketTurn]);

  const hasSave = loaded && day > 0;

  function banner(title, detail, tone) {
    setLastEvent({ title, detail, tone });
  }

  function goToNewScenario() {
    setScenarioDraft(generateScenario());
    setView("scenario");
  }

  function rerollScenario() {
    setScenarioDraft(generateScenario());
  }

  function startGame() {
    setProfession(scenarioDraft.profession);
    setCash(scenarioDraft.startingCash);
    setDebts([scenarioDraft.debt]);
    setKids(0);
    setAssets([]);
    setLastEvent(null);
    setBabyEnabled(true); setLayoffEnabled(true); setLayoffMonthsLeft(0);
    setLastSmallDoodadDay(null); setLastBigDoodadDay(null); setLastBabyDay(null); setLastLayoffDay(null);
    setLuckyUntilDay(0);
    setDay(1);
    setTokens(generateTokens(16));
    setPortfolio({}); setJournal([]); setPendingArcs([]); setSectorConditions({});
    setEconomicModifier({ loanRateMult: 1, expiresTurn: 0 }); setTraderJournalActive(false); setMarketTurn(0);
    setView("game");
  }

  function resetGame() {
    storage.delete(SAVE_KEY).catch(() => {});
    setDay(0);
    setCash(0);
    setProfession(null);
    setDebts([]);
    setView("menu");
  }

  function buyStock(symbol, shares) {
    const token = tokens.find((t) => t.symbol === symbol);
    const n = Math.floor(Number(shares) || 0);
    if (!token || n <= 0) return;
    const gross = token.price * n;
    const fee = Math.round(gross * BROKERAGE_FEE_RATE);
    const cost = gross + fee;
    if (cash < cost) return;
    setCash((c) => c - cost);
    setPortfolio((p) => {
      const existing = p[symbol];
      const prevShares = existing ? existing.shares : 0;
      const prevAvg = existing ? existing.avgCost : 0;
      const newShares = prevShares + n;
      const newAvg = newShares > 0 ? (prevAvg * prevShares + token.price * n) / newShares : token.price;
      return { ...p, [symbol]: { shares: newShares, avgCost: newAvg } };
    });
  }

  function sellStock(symbol, shares) {
    const token = tokens.find((t) => t.symbol === symbol);
    const existing = portfolio[symbol];
    const owned = existing ? existing.shares : 0;
    const n = Math.min(Math.floor(Number(shares) || 0), owned);
    if (!token || n <= 0) return;
    const gross = token.price * n;
    const fee = Math.round(gross * BROKERAGE_FEE_RATE);
    const proceeds = gross - fee;
    setCash((c) => c + proceeds);
    setPortfolio((p) => {
      const remain = owned - n;
      const next = { ...p };
      if (remain <= 0) delete next[symbol];
      else next[symbol] = { shares: remain, avgCost: existing.avgCost };
      return next;
    });
  }

  // --- Résolution des événements quotidiens (auto-résolus, pas de décision du joueur en v1) ---

  function triggerSmallDoodad(currentDay) {
    const card = randNoRepeat(SMALL_DOODAD_CARDS, lastSmallDoodadCardRef);
    const amount = scaleDoodadAmount(card.amount, incomeRatio(profession));
    setCash((c) => Math.max(0, c - amount));
    setLastSmallDoodadDay(currentDay);
    banner("Imprévu", `${card.title} : -${f(amount)}`, "bad");
  }

  function triggerBigDoodad(currentDay) {
    const card = randNoRepeat(BIG_DOODAD_CARDS, lastBigDoodadCardRef);
    const ratio = incomeRatio(profession);
    const amount = scaleDoodadAmount(card.amount, ratio);
    const financed = scaleDoodadAmount(card.bankLoanAdd, ratio);
    const monthlyPayment = Math.max(1, Math.round(financed / BIG_DOODAD_TERM_MONTHS));
    setCash((c) => Math.max(0, c - amount));
    setDebts((ds) => [...ds, { reason: card.title, monthlyPayment, monthsRemaining: BIG_DOODAD_TERM_MONTHS, totalMonths: BIG_DOODAD_TERM_MONTHS, balance: monthlyPayment * BIG_DOODAD_TERM_MONTHS }]);
    setLastBigDoodadDay(currentDay);
    banner("Grosse dépense", `${card.title} : -${f(amount)} comptant + ${f(monthlyPayment)}/mois pendant ${BIG_DOODAD_TERM_MONTHS} mois`, "bad");
  }

  function triggerMarket() {
    const card = randNoRepeat(MARKET_CARDS, lastMarketCardRef);
    const matching = assets.filter((a) => a.type === card.assetType);
    if (matching.length === 0) {
      banner("Marché", `${card.title} — vous ne possédez rien de ce type, aucun effet.`, "info");
      return;
    }
    if (card.effectType === "income") {
      setAssets((prev) => prev.map((a) => {
        if (a.type !== card.assetType) return a;
        const base = a.baseGrossCashflow != null ? a.baseGrossCashflow : (a.grossCashflow != null ? a.grossCashflow : a.cashflow);
        const newGross = Math.max(0, Math.round(base * card.mult));
        return { ...a, baseGrossCashflow: base, grossCashflow: newGross, cashflow: newGross - (a.loanMonthly || 0) };
      }));
      const pct = Math.round((card.mult - 1) * 100);
      banner("Marché", `${card.title} — revenu mensuel ${pct >= 0 ? "+" : ""}${pct}% sur vos actifs concernés.`, card.mult >= 1 ? "good" : "bad");
    } else {
      banner("Marché", `${card.title} — affecte la valeur de revente de vos actifs concernés.`, card.mult >= 1 ? "good" : "bad");
    }
  }

  function triggerCharity(currentDay) {
    const donation = Math.round(profession.salary * 0.1);
    setCash((c) => Math.max(0, c - donation));
    setLuckyUntilDay(currentDay + 30);
    banner("Don effectué", `-${f(donation)}. Un peu plus de chance sur les 30 prochains jours.`, "good");
  }

  function triggerBaby(currentDay) {
    setKids((k) => k + 1);
    setLastBabyDay(currentDay);
    banner("Bébé", `Félicitations ! +${f(profession.perChild)} de dépenses par mois.`, "bad");
  }

  function triggerLayoff(currentDay) {
    setLayoffMonthsLeft(2);
    setLastLayoffDay(currentDay);
    banner("Licencié", "Vous perdez votre emploi. Pas de salaire pendant 2 mois.", "bad");
  }

  // Fait avancer d'un jour : la Bourse tique toujours, un événement quotidien peut
  // se déclencher, et le salaire n'est versé qu'au premier jour de chaque mois.
  function nextDay() {
    const result = tickMarketDays({ tokens, pendingArcs, sectorConditions, economicModifier, marketTurn, traderJournalActive, economicEffectDuration: 10, economicEffectPermanent: false, assets, currency: CURRENCY }, 1);
    setTokens(result.tokens);
    setPendingArcs(result.pendingArcs);
    setSectorConditions(result.sectorConditions);
    setEconomicModifier(result.economicModifier);
    setMarketTurn(result.marketTurn);
    if (result.journalEntries.length) setJournal((j) => [...result.journalEntries.slice().reverse(), ...j].slice(0, 60));

    setDay((d) => {
      const nd = d + 1;
      const lucky = nd < luckyUntilDay;
      const table = buildDailyEventTable({ profession, day: nd, kids, babyEnabled, layoffEnabled, layoffMonthsLeft, lastSmallDoodadDay, lastBigDoodadDay, lastBabyDay, lastLayoffDay, lucky });
      const eventType = rollDailyEvent(table);
      if (eventType === "doodad_small") triggerSmallDoodad(nd);
      else if (eventType === "doodad_big") triggerBigDoodad(nd);
      else if (eventType === "market") triggerMarket();
      else if (eventType === "charity") triggerCharity(nd);
      else if (eventType === "baby") triggerBaby(nd);
      else if (eventType === "layoff") triggerLayoff(nd);

      let payday = 0;
      if ((nd - 1) % 30 === 0) {
        const debtMonthly = debts.reduce((s, deb) => s + deb.monthlyPayment, 0);
        const expenses = calcExpenses(profession, kids, debtMonthly);
        const salary = layoffMonthsLeft > 0 ? 0 : profession.salary;
        payday = salary - expenses;
        setDebts((ds) => ds.map((deb) => {
          const monthsRemaining = deb.monthsRemaining - 1;
          if (monthsRemaining <= 0) return null;
          return { ...deb, monthsRemaining, balance: deb.monthlyPayment * monthsRemaining };
        }).filter(Boolean));
        if (layoffMonthsLeft > 0) setLayoffMonthsLeft((n) => Math.max(0, n - 1));
      }
      const totalCashDelta = result.cashDelta + payday;
      if (totalCashDelta !== 0) setCash((c) => Math.max(0, c + totalCashDelta));
      return nd;
    });
  }

  return {
    loaded, view, setView,
    scenarioDraft, goToNewScenario, rerollScenario, startGame,
    profession, day, cash, debts, kids, hasSave, resetGame, nextDay,
    babyEnabled, setBabyEnabled, layoffEnabled, setLayoffEnabled, layoffMonthsLeft,
    lastEvent,
    tokens, portfolio, journal, marketTurn, traderJournalActive,
    onToggleTraderJournal: () => setTraderJournalActive((v) => !v),
    buyStock, sellStock,
    currency: CURRENCY,
  };
}
