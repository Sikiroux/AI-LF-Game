import { useState, useEffect, useRef } from "react";
import { storage } from "../../../state/storage.js";
import { computeFinancing, amortizedPayment, calcPassiveIncome, MAX_DEBT_RATIO } from "../../../engine/financing.js";
import { generateTokens } from "../../../engine/bourse/tokenGenerator.js";
import { BROKERAGE_FEE_RATE } from "../../../engine/bourse/market.js";
import { fmt, uid } from "../../../utils/format.js";
import { generateScenario } from "../data/scenarioGenerator.js";
import { simulateDays } from "../engine/dayLoop.js";

const SAVE_KEY = "ratrace2-save";
const CURRENCY = "EUR"; // le choix de devise par mode arrive avec les Options par mode

export default function useRatRace2State() {
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState("menu"); // menu | scenario | game | trading | opportunities | assets
  const [scenarioDraft, setScenarioDraft] = useState(null);
  const [profession, setProfession] = useState(null);
  const [day, setDay] = useState(0);
  const [cash, setCash] = useState(0);
  const [debts, setDebts] = useState([]);
  const [kids, setKids] = useState(0);
  const [assets, setAssets] = useState([]);
  const [listings, setListings] = useState([]);
  const [pendingDecision, setPendingDecision] = useState(null);
  const [lastEvent, setLastEvent] = useState(null);

  const [babyEnabled, setBabyEnabled] = useState(true);
  const [layoffEnabled, setLayoffEnabled] = useState(true);
  const [layoffMonthsLeft, setLayoffMonthsLeft] = useState(0);
  const [lastSmallDoodadDay, setLastSmallDoodadDay] = useState(null);
  const [lastBigDoodadDay, setLastBigDoodadDay] = useState(null);
  const [lastBabyDay, setLastBabyDay] = useState(null);
  const [lastLayoffDay, setLastLayoffDay] = useState(null);
  const [luckyUntilDay, setLuckyUntilDay] = useState(0);
  const [skipMonthMode, setSkipMonthMode] = useState("auto"); // auto | calm

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
          if (Array.isArray(s.listings)) setListings(s.listings);
          if (s.babyEnabled !== undefined) setBabyEnabled(s.babyEnabled);
          if (s.layoffEnabled !== undefined) setLayoffEnabled(s.layoffEnabled);
          if (s.layoffMonthsLeft != null) setLayoffMonthsLeft(s.layoffMonthsLeft);
          if (s.lastSmallDoodadDay !== undefined) setLastSmallDoodadDay(s.lastSmallDoodadDay);
          if (s.lastBigDoodadDay !== undefined) setLastBigDoodadDay(s.lastBigDoodadDay);
          if (s.lastBabyDay !== undefined) setLastBabyDay(s.lastBabyDay);
          if (s.lastLayoffDay !== undefined) setLastLayoffDay(s.lastLayoffDay);
          if (s.luckyUntilDay != null) setLuckyUntilDay(s.luckyUntilDay);
          if (s.skipMonthMode) setSkipMonthMode(s.skipMonthMode);
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
      day, cash, profession, debts, kids, assets, listings, babyEnabled, layoffEnabled, layoffMonthsLeft,
      lastSmallDoodadDay, lastBigDoodadDay, lastBabyDay, lastLayoffDay, luckyUntilDay, skipMonthMode,
      tokens, portfolio, journal, pendingArcs, sectorConditions, economicModifier, traderJournalActive, marketTurn,
    };
    storage.set(SAVE_KEY, JSON.stringify(s)).catch(() => {});
  }, [loaded, day, cash, profession, debts, kids, assets, listings, babyEnabled, layoffEnabled, layoffMonthsLeft, lastSmallDoodadDay, lastBigDoodadDay, lastBabyDay, lastLayoffDay, luckyUntilDay, skipMonthMode, tokens, portfolio, journal, pendingArcs, sectorConditions, economicModifier, traderJournalActive, marketTurn]);

  const hasSave = loaded && day > 0;
  const passiveIncome = calcPassiveIncome(assets);

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
    setListings([]);
    setPendingDecision(null);
    setLastEvent(null);
    setBabyEnabled(true); setLayoffEnabled(true); setLayoffMonthsLeft(0);
    setLastSmallDoodadDay(null); setLastBigDoodadDay(null); setLastBabyDay(null); setLastLayoffDay(null);
    setLuckyUntilDay(0);
    lastSmallDoodadCardRef.current = null; lastBigDoodadCardRef.current = null; lastMarketCardRef.current = null;
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

  // --- Site d'opportunités ---

  function openListing(listing) {
    setPendingDecision({ kind: "opportunity", card: listing.card, listingId: listing.id });
  }
  function skipListing() {
    setPendingDecision(null);
  }
  function buyListing(card, mode, listingId) {
    const useLoan = mode !== false;
    const loanRateMult = marketTurn < economicModifier.expiresTurn ? economicModifier.loanRateMult : 1;
    const grossCashflow = card.cashflow;
    const fin = useLoan
      ? computeFinancing(card, "simple", 10, loanRateMult, "realiste", 1)
      : { downPayment: card.cost, loanAmount: 0, loanMonthly: 0, netCashflow: grossCashflow, grossCashflow, annualRate: 0 };
    if (cash < fin.downPayment) return;

    let loanMonthly = fin.loanMonthly, amortizing = false, amortMonths = null;
    if (typeof mode === "number" && fin.loanAmount > 0) {
      loanMonthly = Math.round(amortizedPayment(fin.loanAmount, fin.annualRate, mode / 12));
      amortizing = true; amortMonths = mode;
    }
    const netCashflow = fin.grossCashflow - loanMonthly;

    if (useLoan) {
      const currentDebtPayments = debts.reduce((s, d) => s + d.monthlyPayment, 0) + assets.reduce((s, a) => s + (a.loanMonthly || 0), 0);
      const totalIncome = profession.salary + passiveIncome;
      if (totalIncome > 0 && (currentDebtPayments + loanMonthly) / totalIncome > MAX_DEBT_RATIO) {
        banner("Emprunt refusé", `Taux d'endettement trop élevé (max ${Math.round(MAX_DEBT_RATIO * 100)}%).`, "bad");
        setPendingDecision(null);
        return;
      }
    }

    setCash((c) => c - fin.downPayment);
    setAssets((a) => [...a, {
      id: uid(), name: card.title, type: card.type, sector: card.sector, cost: card.cost,
      downPayment: fin.downPayment, loanAmount: fin.loanAmount, loanBalance: fin.loanAmount,
      loanMonthly, annualRate: fin.annualRate || 0, amortizing, amortMonths,
      grossCashflow: fin.grossCashflow, baseGrossCashflow: fin.grossCashflow, incomeEffectExpiresTurn: null,
      cashflow: netCashflow,
    }]);
    setListings((ls) => ls.filter((l) => l.id !== listingId));
    banner("Achat réalisé", fin.loanAmount > 0 ? `${card.title} : apport ${f(fin.downPayment)}, solde dû ${f(fin.loanAmount)}, net +${f(netCashflow)}/mois` : `${card.title} (comptant) : +${f(netCashflow)}/mois`, "good");
    setPendingDecision(null);
  }

  // --- Mes actifs ---

  function payOffLoan(assetId) {
    const a = assets.find((x) => x.id === assetId);
    if (!a || !(a.loanBalance > 0) || cash < a.loanBalance) return;
    setCash((c) => c - a.loanBalance);
    setAssets((list) => list.map((x) => (x.id === assetId ? { ...x, loanBalance: 0, loanAmount: 0, loanMonthly: 0, amortizing: false, cashflow: x.grossCashflow } : x)));
    banner("Prêt soldé", `${a.name} : solde remboursé d'un coup.`, "good");
  }
  function startAmortization(assetId, months) {
    setAssets((list) => list.map((x) => {
      if (x.id !== assetId || !(x.loanBalance > 0)) return x;
      const payment = Math.round(amortizedPayment(x.loanBalance, x.annualRate, months / 12));
      return { ...x, loanMonthly: payment, amortizing: true, amortMonths: months };
    }));
  }
  function cancelAmortization(assetId) {
    setAssets((list) => list.map((x) => {
      if (x.id !== assetId) return x;
      const interestOnly = Math.round(x.loanBalance * (x.annualRate / 12));
      return { ...x, loanMonthly: interestOnly, amortizing: false };
    }));
  }
  function payOffAllLoans() {
    const owed = assets.filter((a) => a.loanBalance > 0).sort((a, b) => a.loanBalance - b.loanBalance);
    if (owed.length === 0) return;
    let remaining = cash;
    const paidIds = [];
    for (const a of owed) {
      if (a.loanBalance > remaining) continue;
      remaining -= a.loanBalance;
      paidIds.push(a.id);
    }
    if (paidIds.length === 0) {
      banner("Tout rembourser", "Liquidités insuffisantes.", "info");
      return;
    }
    setCash(remaining);
    setAssets((list) => list.map((x) => (paidIds.includes(x.id) ? { ...x, loanBalance: 0, loanAmount: 0, loanMonthly: 0, amortizing: false, cashflow: x.grossCashflow } : x)));
    banner("Tout rembourser", `${paidIds.length} prêt${paidIds.length > 1 ? "s" : ""} soldé${paidIds.length > 1 ? "s" : ""}.`, "good");
  }

  // --- Avancée du temps : un jour, ou sauter jusqu'au prochain jour de paie ---

  function applySimResult(result) {
    setDay(result.day);
    setCash(result.cash);
    setDebts(result.debts);
    setKids(result.kids);
    setAssets(result.assets);
    setListings(result.listings);
    setTokens(result.tokens);
    setPendingArcs(result.pendingArcs);
    setSectorConditions(result.sectorConditions);
    setEconomicModifier(result.economicModifier);
    setMarketTurn(result.marketTurn);
    setLayoffMonthsLeft(result.layoffMonthsLeft);
    setLastSmallDoodadDay(result.lastSmallDoodadDay);
    setLastBigDoodadDay(result.lastBigDoodadDay);
    setLastBabyDay(result.lastBabyDay);
    setLastLayoffDay(result.lastLayoffDay);
    setLuckyUntilDay(result.luckyUntilDay);
    if (result.journalEntries.length) setJournal((j) => [...result.journalEntries.slice().reverse(), ...j].slice(0, 60));
    if (result.events.length === 1) {
      const e = result.events[0];
      banner(e.title, e.detail, e.tone);
    } else if (result.events.length > 1) {
      banner("Résumé de la période", `${result.events.length} événements : ${result.events.map((e) => e.title).join(", ")}`, "info");
    }
  }

  function snapshot() {
    return {
      day, cash, profession, debts, kids, assets, listings,
      tokens, pendingArcs, sectorConditions, economicModifier, marketTurn, traderJournalActive,
      babyEnabled, layoffEnabled, layoffMonthsLeft,
      lastSmallDoodadDay, lastBigDoodadDay, lastBabyDay, lastLayoffDay, luckyUntilDay,
    };
  }
  const refs = () => ({ small: lastSmallDoodadCardRef, big: lastBigDoodadCardRef, market: lastMarketCardRef });

  function nextDay() {
    applySimResult(simulateDays(snapshot(), 1, { quiet: false, currency: CURRENCY, refs: refs() }));
  }

  // Avance jusqu'au premier jour du mois suivant (jamais moins d'un jour).
  function skipMonth() {
    const daysToSkip = 30 - ((day - 1) % 30);
    applySimResult(simulateDays(snapshot(), daysToSkip, { quiet: skipMonthMode === "calm", currency: CURRENCY, refs: refs() }));
  }

  return {
    loaded, view, setView,
    scenarioDraft, goToNewScenario, rerollScenario, startGame,
    profession, day, cash, debts, kids, assets, passiveIncome, hasSave, resetGame, nextDay, skipMonth,
    skipMonthMode, setSkipMonthMode,
    babyEnabled, setBabyEnabled, layoffEnabled, setLayoffEnabled, layoffMonthsLeft,
    lastEvent,
    tokens, portfolio, journal, marketTurn, traderJournalActive,
    onToggleTraderJournal: () => setTraderJournalActive((v) => !v),
    buyStock, sellStock,
    listings, pendingDecision, openListing, skipListing, buyListing,
    payOffLoan, startAmortization, cancelAmortization, payOffAllLoans,
    currency: CURRENCY,
  };
}
