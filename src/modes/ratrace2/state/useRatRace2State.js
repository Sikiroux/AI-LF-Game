import { useState, useEffect } from "react";
import { storage } from "../../../state/storage.js";
import { calcExpenses } from "../../../engine/financing.js";
import { generateTokens } from "../../../engine/bourse/tokenGenerator.js";
import { BROKERAGE_FEE_RATE, tickMarketDays } from "../../../engine/bourse/market.js";
import { generateScenario } from "../data/scenarioGenerator.js";

const SAVE_KEY = "ratrace2-save";
const CURRENCY = "EUR"; // le choix de devise par mode arrive avec les Options par mode

export default function useRatRace2State() {
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState("menu"); // menu | scenario | game | trading
  const [scenarioDraft, setScenarioDraft] = useState(null);
  const [profession, setProfession] = useState(null);
  const [day, setDay] = useState(0);
  const [cash, setCash] = useState(0);
  const [debt, setDebt] = useState(null);

  const [tokens, setTokens] = useState(() => generateTokens(16));
  const [portfolio, setPortfolio] = useState({});
  const [journal, setJournal] = useState([]);
  const [pendingArcs, setPendingArcs] = useState([]);
  const [sectorConditions, setSectorConditions] = useState({});
  const [economicModifier, setEconomicModifier] = useState({ loanRateMult: 1, expiresTurn: 0 });
  const [traderJournalActive, setTraderJournalActive] = useState(false);
  const [marketTurn, setMarketTurn] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await storage.get(SAVE_KEY);
        if (res && res.value) {
          const s = JSON.parse(res.value);
          if (s.day) setDay(s.day);
          if (s.cash != null) setCash(s.cash);
          if (s.profession) setProfession(s.profession);
          if (s.debt !== undefined) setDebt(s.debt);
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
    const s = { day, cash, profession, debt, tokens, portfolio, journal, pendingArcs, sectorConditions, economicModifier, traderJournalActive, marketTurn };
    storage.set(SAVE_KEY, JSON.stringify(s)).catch(() => {});
  }, [loaded, day, cash, profession, debt, tokens, portfolio, journal, pendingArcs, sectorConditions, economicModifier, traderJournalActive, marketTurn]);

  const hasSave = loaded && day > 0;

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
    setDebt(scenarioDraft.debt);
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
    setDebt(null);
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

  // Fait avancer d'un jour : la Bourse tique toujours d'un jour, le salaire n'est
  // versé qu'au premier jour de chaque mois (tous les 30 jours).
  function nextDay() {
    const result = tickMarketDays({ tokens, pendingArcs, sectorConditions, economicModifier, marketTurn, traderJournalActive, economicEffectDuration: 10, economicEffectPermanent: false, assets: [], currency: CURRENCY }, 1);
    setTokens(result.tokens);
    setPendingArcs(result.pendingArcs);
    setSectorConditions(result.sectorConditions);
    setEconomicModifier(result.economicModifier);
    setMarketTurn(result.marketTurn);
    if (result.journalEntries.length) setJournal((j) => [...result.journalEntries.slice().reverse(), ...j].slice(0, 60));

    setDay((d) => {
      const nd = d + 1;
      let payday = 0;
      if ((nd - 1) % 30 === 0) {
        const expenses = calcExpenses(profession, 0, 0) + (debt ? debt.monthlyPayment : 0);
        payday = profession.salary - expenses;
        setDebt((deb) => {
          if (!deb) return deb;
          const monthsRemaining = deb.monthsRemaining - 1;
          if (monthsRemaining <= 0) return null;
          return { ...deb, monthsRemaining, balance: deb.monthlyPayment * monthsRemaining };
        });
      }
      const totalCashDelta = result.cashDelta + payday;
      if (totalCashDelta !== 0) setCash((c) => Math.max(0, c + totalCashDelta));
      return nd;
    });
  }

  return {
    loaded, view, setView,
    scenarioDraft, goToNewScenario, rerollScenario, startGame,
    profession, day, cash, debt, hasSave, resetGame, nextDay,
    tokens, portfolio, journal, marketTurn, traderJournalActive,
    onToggleTraderJournal: () => setTraderJournalActive((v) => !v),
    buyStock, sellStock,
    currency: CURRENCY,
  };
}
