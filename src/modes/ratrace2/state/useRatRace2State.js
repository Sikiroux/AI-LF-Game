import { useState, useEffect, useRef } from "react";
import { storage } from "../../../state/storage.js";
import { computeFinancing, amortizedPayment, calcExpenses, calcPassiveIncome, MAX_DEBT_RATIO } from "../../../engine/financing.js";
import { generateTokens } from "../../../engine/bourse/tokenGenerator.js";
import { BROKERAGE_FEE_RATE, tickMarketDays } from "../../../engine/bourse/market.js";
import { fmt, randNoRepeat, uid } from "../../../utils/format.js";
import { MARKET_CARDS } from "../../../data/marketCards.js";
import { generateScenario } from "../data/scenarioGenerator.js";
import { advanceListings } from "../engine/opportunitySite.js";
import {
  SMALL_DOODAD_CARDS, BIG_DOODAD_CARDS, BIG_DOODAD_TERM_MONTHS,
  incomeRatio, scaleDoodadAmount, buildDailyEventTable, rollDailyEvent,
} from "../engine/dailyEvents.js";

const SAVE_KEY = "ratrace2-save";
const CURRENCY = "EUR"; // le choix de devise par mode arrive avec les Options par mode

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
      lastSmallDoodadDay, lastBigDoodadDay, lastBabyDay, lastLayoffDay, luckyUntilDay,
      tokens, portfolio, journal, pendingArcs, sectorConditions, economicModifier, traderJournalActive, marketTurn,
    };
    storage.set(SAVE_KEY, JSON.stringify(s)).catch(() => {});
  }, [loaded, day, cash, profession, debts, kids, assets, listings, babyEnabled, layoffEnabled, layoffMonthsLeft, lastSmallDoodadDay, lastBigDoodadDay, lastBabyDay, lastLayoffDay, luckyUntilDay, tokens, portfolio, journal, pendingArcs, sectorConditions, economicModifier, traderJournalActive, marketTurn]);

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

  // Fait avancer d'un jour : la Bourse tique, le site d'opportunités se renouvelle,
  // un événement quotidien peut se déclencher, et le salaire n'est versé qu'au
  // premier jour de chaque mois.
  function nextDay() {
    const nd = day + 1;

    const result = tickMarketDays({ tokens, pendingArcs, sectorConditions, economicModifier, marketTurn, traderJournalActive, economicEffectDuration: 10, economicEffectPermanent: false, assets, currency: CURRENCY }, 1);
    setTokens(result.tokens);
    setPendingArcs(result.pendingArcs);
    setSectorConditions(result.sectorConditions);
    setEconomicModifier(result.economicModifier);
    setMarketTurn(result.marketTurn);
    if (result.journalEntries.length) setJournal((j) => [...result.journalEntries.slice().reverse(), ...j].slice(0, 60));

    setListings((ls) => advanceListings(ls, nd, cash));

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
      payday = salary + passiveIncome - expenses;
      setDebts((ds) => ds.map((deb) => {
        const monthsRemaining = deb.monthsRemaining - 1;
        if (monthsRemaining <= 0) return null;
        return { ...deb, monthsRemaining, balance: deb.monthlyPayment * monthsRemaining };
      }).filter(Boolean));
      if (layoffMonthsLeft > 0) setLayoffMonthsLeft((n) => Math.max(0, n - 1));
      setAssets((list) => amortizeAssetsList(list));
    }
    const totalCashDelta = result.cashDelta + payday;
    if (totalCashDelta !== 0) setCash((c) => Math.max(0, c + totalCashDelta));
    setDay(nd);
  }

  return {
    loaded, view, setView,
    scenarioDraft, goToNewScenario, rerollScenario, startGame,
    profession, day, cash, debts, kids, assets, passiveIncome, hasSave, resetGame, nextDay,
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
