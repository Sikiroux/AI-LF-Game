import { useState, useEffect, useRef } from "react";
import { storage } from "../../../state/storage.js";
import { computeFinancing, amortizedPayment, calcExpenses, calcPassiveIncome, randomizeLiabilities, LIABILITY_LABELS, MAX_DEBT_RATIO } from "../../../engine/financing.js";
import { generateTokens } from "../../../engine/bourse/tokenGenerator.js";
import { BROKERAGE_FEE_RATE } from "../../../engine/bourse/market.js";
import { fmt, uid } from "../../../utils/format.js";
import { generateScenario } from "../data/scenarioGenerator.js";
import { simulateDays } from "../engine/dayLoop.js";
import {
  initAssetIndicators, canPerformMaintenance, performMaintenance,
  totalSalaries, hireEmployee, fireEmployee, fireSeverance, trainEmployee, trainingCost, MAX_EMPLOYEES,
  applyStakePurchase, DEFAULT_MANAGEMENT_THRESHOLD_PCT,
} from "../engine/assetIndicators.js";
import { DAILY_ACTION_POINTS, ACTION_COSTS } from "../engine/actionPoints.js";
import {
  TRAININGS, startTraining, tickTraining, jobRequirementsMet, rollApplication,
  JOB_APPLY_PA_COST, JOB_REJECTION_COOLDOWN_DAYS, generateMissions, completeMission,
  REST_THRESHOLD_DAYS, rollBurnout, burnoutCost, BURNOUT_LAYOFF_MONTHS, rollDivorce, divorceCost,
} from "../engine/career.js";
import { PROFESSIONS } from "../../../data/professions.js";
import { SKILL_LABELS } from "../../../data/skills.js";

const SAVE_KEY = "capitallife-save";
const SETTINGS_KEY = "capitallife-settings";

export default function useCapitalLifeState() {
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState("menu"); // menu | scenario | game | trading | opportunities | assets | casino
  const [phase, setPhase] = useState("playing"); // playing | won | bankrupt
  const [scenarioDraft, setScenarioDraft] = useState(null);
  const [profession, setProfession] = useState(null);
  const [day, setDay] = useState(0);
  const [cash, setCash] = useState(0);
  const [debts, setDebts] = useState([]);
  const [liabilities, setLiabilities] = useState({});
  const [kids, setKids] = useState(0);
  const [assets, setAssets] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [listings, setListings] = useState([]);
  const [pendingDecision, setPendingDecision] = useState(null);
  const [lastEvent, setLastEvent] = useState(null);
  const [lastSkipReport, setLastSkipReport] = useState(null);
  const [casinoHandsPlayed, setCasinoHandsPlayed] = useState(0);
  const [casinoNetResult, setCasinoNetResult] = useState(0);
  const [actionPoints, setActionPoints] = useState(DAILY_ACTION_POINTS);

  // --- Carrière : compétences, formation, job board, missions freelance,
  // surmenage et statut de couple (cf. engine/career.js).
  const [skills, setSkills] = useState({});
  const [training, setTraining] = useState(null);
  const [missions, setMissions] = useState([]);
  const [daysWithoutRest, setDaysWithoutRest] = useState(0);
  const [enCouple, setEnCouple] = useState(false);
  const [lastJobRejectionDay, setLastJobRejectionDay] = useState(null);

  const [currency, setCurrency] = useState("EUR");
  const [babyEnabled, setBabyEnabled] = useState(true);
  const [layoffEnabled, setLayoffEnabled] = useState(true);
  const [skipMonthMode, setSkipMonthMode] = useState("auto"); // auto | calm
  const [managementThresholdPct, setManagementThresholdPct] = useState(DEFAULT_MANAGEMENT_THRESHOLD_PCT);
  const [dailyActionPoints, setDailyActionPoints] = useState(DAILY_ACTION_POINTS);
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
  const f = (n) => fmt(n, currency);

  useEffect(() => {
    (async () => {
      try {
        const res = await storage.get(SAVE_KEY);
        if (res && res.value) {
          const s = JSON.parse(res.value);
          if (s.day) setDay(s.day);
          if (s.cash != null) setCash(s.cash);
          if (s.profession) setProfession(s.profession);
          if (s.phase) setPhase(s.phase);
          if (s.casinoHandsPlayed != null) setCasinoHandsPlayed(s.casinoHandsPlayed);
          if (s.casinoNetResult != null) setCasinoNetResult(s.casinoNetResult);
          if (s.actionPoints != null) setActionPoints(s.actionPoints);
          if (Array.isArray(s.debts)) setDebts(s.debts);
          if (s.liabilities) setLiabilities(s.liabilities);
          if (s.kids != null) setKids(s.kids);
          if (Array.isArray(s.assets)) setAssets(s.assets);
          if (Array.isArray(s.listings)) setListings(s.listings);
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
          if (s.skills) setSkills(s.skills);
          if (s.training !== undefined) setTraining(s.training);
          if (Array.isArray(s.missions)) setMissions(s.missions);
          if (s.daysWithoutRest != null) setDaysWithoutRest(s.daysWithoutRest);
          if (s.enCouple !== undefined) setEnCouple(s.enCouple);
          if (s.lastJobRejectionDay !== undefined) setLastJobRejectionDay(s.lastJobRejectionDay);
        }
      } catch (e) { /* pas de sauvegarde existante */ }
      try {
        const res2 = await storage.get(SETTINGS_KEY);
        if (res2 && res2.value) {
          const st = JSON.parse(res2.value);
          if (st.currency) setCurrency(st.currency);
          if (st.babyEnabled !== undefined) setBabyEnabled(st.babyEnabled);
          if (st.layoffEnabled !== undefined) setLayoffEnabled(st.layoffEnabled);
          if (st.skipMonthMode) setSkipMonthMode(st.skipMonthMode);
          if (st.managementThresholdPct != null) setManagementThresholdPct(st.managementThresholdPct);
          if (st.dailyActionPoints != null) setDailyActionPoints(st.dailyActionPoints);
        }
      } catch (e) { /* pas de réglages existants */ }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded || day === 0) return;
    const s = {
      day, cash, profession, phase, debts, liabilities, kids, assets, listings, layoffMonthsLeft,
      lastSmallDoodadDay, lastBigDoodadDay, lastBabyDay, lastLayoffDay, luckyUntilDay,
      casinoHandsPlayed, casinoNetResult, actionPoints,
      tokens, portfolio, journal, pendingArcs, sectorConditions, economicModifier, traderJournalActive, marketTurn,
      skills, training, missions, daysWithoutRest, enCouple, lastJobRejectionDay,
    };
    storage.set(SAVE_KEY, JSON.stringify(s)).catch(() => {});
  }, [loaded, day, cash, profession, phase, debts, liabilities, kids, assets, listings, layoffMonthsLeft, lastSmallDoodadDay, lastBigDoodadDay, lastBabyDay, lastLayoffDay, luckyUntilDay, casinoHandsPlayed, casinoNetResult, actionPoints, tokens, portfolio, journal, pendingArcs, sectorConditions, economicModifier, traderJournalActive, marketTurn, skills, training, missions, daysWithoutRest, enCouple, lastJobRejectionDay]);

  useEffect(() => {
    if (!loaded) return;
    const st = { currency, babyEnabled, layoffEnabled, skipMonthMode, managementThresholdPct, dailyActionPoints };
    storage.set(SETTINGS_KEY, JSON.stringify(st)).catch(() => {});
  }, [loaded, currency, babyEnabled, layoffEnabled, skipMonthMode, managementThresholdPct, dailyActionPoints]);

  const hasSave = loaded && day > 0 && phase !== "won" && phase !== "bankrupt";
  const passiveIncome = calcPassiveIncome(assets);

  useEffect(() => {
    if (phase !== "playing" || !profession) return;
    const debtMonthly = debts.reduce((s, d) => s + d.monthlyPayment, 0);
    const totalExpenses = calcExpenses(profession, kids, debtMonthly, liabilities);
    if (totalExpenses > 0 && passiveIncome >= totalExpenses) {
      setPhase("won");
    }
  }, [phase, profession, debts, liabilities, kids, passiveIncome]);

  function banner(title, detail, tone) {
    setLastEvent({ title, detail, tone });
  }

  // Ne gate que les actions de gestion (négocier un achat, entretenir,
  // recruter, former, licencier) — jamais la navigation entre applis.
  function spendActionPoints(cost) {
    if (actionPoints < cost) {
      banner("Plus assez de temps aujourd'hui", `Cette action demande ${cost} points d'action, il n'en reste que ${actionPoints}. Revenez demain.`, "info");
      return false;
    }
    setActionPoints((p) => p - cost);
    return true;
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
    setPhase("playing");
    setDebts([scenarioDraft.debt]);
    setLiabilities(randomizeLiabilities(scenarioDraft.profession));
    setKids(0);
    setAssets([]);
    setListings([]);
    setPendingDecision(null);
    setLastEvent(null);
    setCasinoHandsPlayed(0); setCasinoNetResult(0);
    setActionPoints(dailyActionPoints);
    setLayoffMonthsLeft(0);
    setLastSmallDoodadDay(null); setLastBigDoodadDay(null); setLastBabyDay(null); setLastLayoffDay(null);
    setLuckyUntilDay(0);
    lastSmallDoodadCardRef.current = null; lastBigDoodadCardRef.current = null; lastMarketCardRef.current = null;
    setDay(1);
    setTokens(generateTokens(16));
    setPortfolio({}); setJournal([]); setPendingArcs([]); setSectorConditions({});
    setEconomicModifier({ loanRateMult: 1, expiresTurn: 0 }); setTraderJournalActive(false); setMarketTurn(0);
    setSkills({ ...(scenarioDraft.profession.startingSkills || {}) });
    setTraining(null);
    setMissions(generateMissions(scenarioDraft.profession.startingSkills || {}));
    setDaysWithoutRest(0);
    setEnCouple(Math.random() < 0.5);
    setLastJobRejectionDay(null);
    setView("game");
  }

  function resetGame() {
    storage.delete(SAVE_KEY).catch(() => {});
    setDay(0);
    setCash(0);
    setProfession(null);
    setPhase("playing");
    setDebts([]);
    setLiabilities({});
    setSkills({});
    setTraining(null);
    setMissions([]);
    setDaysWithoutRest(0);
    setEnCouple(false);
    setLastJobRejectionDay(null);
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
    const indicators = initAssetIndicators(card, managementThresholdPct);
    const netCashflow = fin.grossCashflow - loanMonthly - totalSalaries({ employees: indicators?.employees });

    if (useLoan) {
      const currentDebtPayments = debts.reduce((s, d) => s + d.monthlyPayment, 0) + assets.reduce((s, a) => s + (a.loanMonthly || 0), 0);
      const totalIncome = profession.salary + passiveIncome;
      if (totalIncome > 0 && (currentDebtPayments + loanMonthly) / totalIncome > MAX_DEBT_RATIO) {
        banner("Emprunt refusé", `Taux d'endettement trop élevé (max ${Math.round(MAX_DEBT_RATIO * 100)}%).`, "bad");
        setPendingDecision(null);
        return;
      }
    }
    if (!spendActionPoints(ACTION_COSTS.buyAsset)) { setPendingDecision(null); return; }

    setCash((c) => c - fin.downPayment);
    setAssets((a) => [...a, {
      id: uid(), name: card.title, type: card.type, sector: card.sector, cost: card.cost,
      downPayment: fin.downPayment, loanAmount: fin.loanAmount, loanBalance: fin.loanAmount,
      loanMonthly, annualRate: fin.annualRate || 0, amortizing, amortMonths,
      grossCashflow: fin.grossCashflow, baseGrossCashflow: fin.grossCashflow, incomeEffectExpiresTurn: null,
      cashflow: netCashflow,
      ...indicators,
    }]);
    setListings((ls) => ls.filter((l) => l.id !== listingId));
    banner("Achat réalisé", fin.loanAmount > 0 ? `${card.title} : apport ${f(fin.downPayment)}, solde dû ${f(fin.loanAmount)}, net +${f(netCashflow)}/mois` : `${card.title} (comptant) : +${f(netCashflow)}/mois`, "good");
    setPendingDecision(null);
  }

  // --- Mes dettes ---

  // Solde d'un coup une des 4 dettes de départ (prêt immo/auto/carte/étudiant).
  function payOffLiability(key) {
    const balance = liabilities[key];
    if (!(balance > 0) || cash < balance) return;
    setCash((c) => c - balance);
    setLiabilities((l) => ({ ...l, [key]: 0 }));
    banner("Dette remboursée", `${LIABILITY_LABELS[key]} soldé pour ${f(balance)}.`, "good");
  }

  // Solde par anticipation une dette de scénario/imprévu (tableau `debts`).
  function payOffDebt(debtId) {
    const d = debts.find((x) => x.id === debtId);
    if (!d || !(d.balance > 0) || cash < d.balance) return;
    setCash((c) => c - d.balance);
    setDebts((list) => list.filter((x) => x.id !== debtId));
    banner("Dette remboursée", `${d.reason} soldée pour ${f(d.balance)}.`, "good");
  }

  // --- Mes actifs ---

  function payOffLoan(assetId) {
    const a = assets.find((x) => x.id === assetId);
    if (!a || !(a.loanBalance > 0) || cash < a.loanBalance) return;
    setCash((c) => c - a.loanBalance);
    setAssets((list) => list.map((x) => (x.id === assetId ? { ...x, loanBalance: 0, loanAmount: 0, loanMonthly: 0, amortizing: false, cashflow: x.grossCashflow - totalSalaries(x) } : x)));
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
    setAssets((list) => list.map((x) => (paidIds.includes(x.id) ? { ...x, loanBalance: 0, loanAmount: 0, loanMonthly: 0, amortizing: false, cashflow: x.grossCashflow - totalSalaries(x) } : x)));
    banner("Tout rembourser", `${paidIds.length} prêt${paidIds.length > 1 ? "s" : ""} soldé${paidIds.length > 1 ? "s" : ""}.`, "good");
  }

  // Entretien préventif choisi par le joueur, pour contrer la dérive naturelle
  // de l'état sans attendre une panne/réparation forcée.
  function performAssetMaintenance(assetId) {
    const a = assets.find((x) => x.id === assetId);
    if (!a) return;
    const check = canPerformMaintenance(a, day, cash);
    if (!check.ok) { banner("Entretien impossible", check.reason, "info"); return; }
    if (!spendActionPoints(ACTION_COSTS.maintenance)) return;
    const { asset: updated, cost } = performMaintenance(a, day);
    const history = [{ day, title: "Entretien préventif", detail: `-${f(cost)}, état amélioré.`, tone: "good" }, ...(a.history || [])].slice(0, 8);
    setCash((c) => c - cost);
    setAssets((list) => list.map((x) => (x.id === assetId ? { ...updated, history } : x)));
    banner("Entretien réalisé", `${a.name} : -${f(cost)}, état amélioré.`, "good");
  }

  // --- Employés (business rachetés uniquement) ---

  function hireAssetEmployee(assetId, candidate) {
    const a = assets.find((x) => x.id === assetId);
    if (!a) return;
    if ((a.employees || []).length >= MAX_EMPLOYEES) { banner("Recrutement impossible", "Effectif maximum atteint.", "info"); return; }
    if (!spendActionPoints(ACTION_COSTS.hire)) return;
    const updated = hireEmployee(a, candidate);
    setAssets((list) => list.map((x) => (x.id === assetId ? { ...updated, cashflow: x.cashflow - candidate.salary } : x)));
    banner("Recrutement", `${candidate.name} rejoint ${a.name} (${f(candidate.salary)}/mois).`, "good");
  }

  function fireAssetEmployee(assetId, employeeId) {
    const a = assets.find((x) => x.id === assetId);
    if (!a) return;
    const emp = (a.employees || []).find((e) => e.id === employeeId);
    if (!emp) return;
    const severance = fireSeverance(emp);
    if (cash < severance) { banner("Licenciement impossible", "Liquidités insuffisantes pour l'indemnité de départ.", "info"); return; }
    if (!spendActionPoints(ACTION_COSTS.fire)) return;
    const updated = fireEmployee(a, employeeId);
    setCash((c) => c - severance);
    setAssets((list) => list.map((x) => (x.id === assetId ? { ...updated, cashflow: x.cashflow + emp.salary } : x)));
    banner("Licenciement", `${emp.name} quitte ${a.name}. Indemnité de départ : ${f(severance)}.`, "bad");
  }

  function trainAssetEmployee(assetId, employeeId) {
    const a = assets.find((x) => x.id === assetId);
    if (!a) return;
    const emp = (a.employees || []).find((e) => e.id === employeeId);
    if (!emp) return;
    const cost = trainingCost(emp);
    if (cash < cost) { banner("Formation impossible", "Liquidités insuffisantes.", "info"); return; }
    if (!spendActionPoints(ACTION_COSTS.train)) return;
    const updated = trainEmployee(a, employeeId);
    setCash((c) => c - cost);
    setAssets((list) => list.map((x) => (x.id === assetId ? updated : x)));
    banner("Formation", `${emp.name} monte en compétence chez ${a.name} (-${f(cost)}).`, "good");
  }

  // Rachat de parts supplémentaires sur une entreprise détenue en participation
  // minoritaire (cf. bug "Laverie (part)") : cash ou financement, même logique
  // simplifiée que l'achat initial (10% d'apport, taux "simple").
  function buyAssetStake(assetId, deltaPct, useLoan) {
    const a = assets.find((x) => x.id === assetId);
    if (!a || a.type !== "business") return;
    const currentPct = a.stakePct ?? 100;
    const newPct = Math.min(100, currentPct + deltaPct);
    const actualDelta = newPct - currentPct;
    if (actualDelta <= 0) return;
    const perPctCost = a.cost / currentPct;
    const perPctGross = (a.baseGrossCashflow ?? a.grossCashflow ?? 0) / currentPct;
    const addedCost = Math.round(perPctCost * actualDelta);
    const addedGross = Math.round(perPctGross * actualDelta);
    const loanRateMult = marketTurn < economicModifier.expiresTurn ? economicModifier.loanRateMult : 1;
    const fin = useLoan
      ? computeFinancing({ cost: addedCost, cashflow: addedGross, type: "business" }, "simple", 10, loanRateMult, "realiste", 1)
      : { downPayment: addedCost, loanAmount: 0, loanMonthly: 0, annualRate: 0 };
    if (cash < fin.downPayment) { banner("Rachat de parts impossible", "Liquidités insuffisantes pour l'apport.", "info"); return; }
    if (!spendActionPoints(ACTION_COSTS.buyAsset)) return;
    const updated = applyStakePurchase(a, { newPct, addedCost, addedGross, loanAmount: fin.loanAmount, loanMonthly: fin.loanMonthly, annualRate: fin.annualRate }, managementThresholdPct);
    setCash((c) => c - fin.downPayment);
    setAssets((list) => list.map((x) => (x.id === assetId ? updated : x)));
    banner("Parts rachetées", `${a.name} : participation portée à ${newPct}% (+${f(addedGross)}/mois).`, "good");
  }

  // --- Avancée du temps : un jour, ou sauter jusqu'au prochain jour de paie ---

  function applySimResult(result, report) {
    setDay(result.day);
    setCash(result.cash);
    setDebts(result.debts);
    setLiabilities(result.liabilities);
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
    setActionPoints(dailyActionPoints);
    if (result.bankrupt) setPhase("bankrupt");
    if (result.journalEntries.length) setJournal((j) => [...result.journalEntries.slice().reverse(), ...j].slice(0, 60));
    if (result.events.length === 1) {
      const e = result.events[0];
      banner(e.title, e.detail, e.tone);
    } else if (result.events.length > 1) {
      banner("Résumé de la période", `${result.events.length} événements : ${result.events.map((e) => e.title).join(", ")}`, "info");
    }
    setLastSkipReport(report || null);
  }

  function snapshot() {
    return {
      day, cash, profession, debts, liabilities, kids, assets, listings,
      tokens, pendingArcs, sectorConditions, economicModifier, marketTurn, traderJournalActive,
      babyEnabled, layoffEnabled, layoffMonthsLeft,
      lastSmallDoodadDay, lastBigDoodadDay, lastBabyDay, lastLayoffDay, luckyUntilDay,
    };
  }
  const refs = () => ({ small: lastSmallDoodadCardRef, big: lastBigDoodadCardRef, market: lastMarketCardRef });

  // Applique la formation en cours (numDays jours) et régénère les missions
  // freelance pour la période à venir — commun à "Jour suivant" et "Sauter le
  // mois". Retourne le coût en PA/jour de la formation encore active (0 si
  // aucune), pour ajuster le budget de la journée qui commence.
  function tickCareer(numDays) {
    const result = tickTraining(training, skills, numDays);
    setTraining(result.training);
    setSkills(result.skills);
    setMissions(generateMissions(result.skills));
    if (result.completed) banner("Formation terminée", "Votre compétence a progressé.", "good");
    return result.training ? result.training.paCost : 0;
  }

  function nextDay() {
    // Surmenage : mesuré sur les PA restants à la fin de la journée qui
    // s'achève (avant que le budget du lendemain ne soit recalculé). Chaque
    // jour où tout le budget a été dépensé (formation + missions + gestion)
    // compte comme un jour sans repos ; se reposer un seul jour remet à zéro.
    const usedAllPA = actionPoints <= 0;
    const newDaysWithoutRest = usedAllPA ? daysWithoutRest + 1 : 0;

    let careerEvent = null;
    let cashAdjust = 0;
    let forcedLayoffMonths = 0;
    if (newDaysWithoutRest > REST_THRESHOLD_DAYS) {
      if (rollBurnout(newDaysWithoutRest)) {
        const cost = burnoutCost();
        cashAdjust -= cost;
        forcedLayoffMonths = BURNOUT_LAYOFF_MONTHS;
        careerEvent = { title: "Burnout", detail: `Vous craquez sous la charge de travail : arrêt ${BURNOUT_LAYOFF_MONTHS} mois, -${f(cost)} de frais médicaux/psy.`, tone: "bad" };
      } else if (enCouple && rollDivorce(newDaysWithoutRest)) {
        const cost = divorceCost(cash);
        cashAdjust -= cost;
        setEnCouple(false);
        careerEvent = { title: "Divorce", detail: `Le rythme a eu raison du couple : -${f(cost)} de règlement.`, tone: "bad" };
      }
    }
    setDaysWithoutRest(forcedLayoffMonths > 0 ? 0 : newDaysWithoutRest);

    const trainingPaCost = tickCareer(1);

    const snap = snapshot();
    if (forcedLayoffMonths > 0) snap.layoffMonthsLeft = Math.max(snap.layoffMonthsLeft, forcedLayoffMonths);
    if (cashAdjust !== 0) snap.cash = Math.max(0, snap.cash + cashAdjust);

    applySimResult(simulateDays(snap, 1, { quiet: false, currency, refs: refs() }));
    if (careerEvent) banner(careerEvent.title, careerEvent.detail, careerEvent.tone);
    setActionPoints(Math.max(0, dailyActionPoints - trainingPaCost));
  }

  // Avance jusqu'au premier jour du mois suivant (jamais moins d'un jour).
  // Le surmenage ne s'accumule pas pendant un saut (pas de décisions de PA
  // prises jour par jour) — le compteur repart à zéro.
  function skipMonth() {
    const daysToSkip = 30 - ((day - 1) % 30);
    const fromDay = day;
    const cashBefore = cash;
    const trainingPaCost = tickCareer(daysToSkip);
    setDaysWithoutRest(0);
    const result = simulateDays(snapshot(), daysToSkip, { quiet: skipMonthMode === "calm", currency, refs: refs() });
    applySimResult(result, {
      mode: skipMonthMode,
      fromDay, toDay: result.day, daysSkipped: daysToSkip,
      cashBefore, cashAfter: result.cash,
      events: result.events, journalEntries: result.journalEntries,
    });
    setActionPoints(Math.max(0, dailyActionPoints - trainingPaCost));
  }

  // --- Carrière : formation, job board, missions freelance ---

  function beginTraining(skillKey, trainingKey) {
    if (training) { banner("Formation impossible", "Une formation est déjà en cours.", "info"); return; }
    const t = TRAININGS.find((x) => x.key === trainingKey);
    if (!t) return;
    if (cash < t.cashCost) { banner("Formation impossible", "Liquidités insuffisantes.", "info"); return; }
    setCash((c) => c - t.cashCost);
    setTraining(startTraining(skillKey, trainingKey));
    banner("Formation commencée", `${t.label} en ${SKILL_LABELS[skillKey]} : ${t.days} jours, -${t.paCost} PA/jour, -${f(t.cashCost)}.`, "good");
  }

  function applyToJob(professionId) {
    if (lastJobRejectionDay != null && day - lastJobRejectionDay < JOB_REJECTION_COOLDOWN_DAYS) {
      banner("Candidature impossible", `Revenez dans ${JOB_REJECTION_COOLDOWN_DAYS - (day - lastJobRejectionDay)} jour${JOB_REJECTION_COOLDOWN_DAYS - (day - lastJobRejectionDay) > 1 ? "s" : ""}.`, "info");
      return;
    }
    if (!jobRequirementsMet(skills, professionId)) {
      banner("Candidature impossible", "Compétences insuffisantes pour ce poste.", "info");
      return;
    }
    if (!spendActionPoints(JOB_APPLY_PA_COST)) return;
    const prof = PROFESSIONS.find((p) => p.id === professionId);
    const result = rollApplication(skills, professionId);
    if (result.accepted) {
      setProfession(prof);
      setLastJobRejectionDay(null);
      banner("Poste obtenu !", `Vous êtes désormais ${prof.name} (${f(prof.salary)}/mois).`, "good");
    } else {
      setLastJobRejectionDay(day);
      banner("Candidature refusée", `${prof.name} : la candidature n'a pas abouti cette fois-ci.`, "bad");
    }
  }

  function doMission(missionId) {
    const m = missions.find((x) => x.id === missionId);
    if (!m) return;
    if (!spendActionPoints(m.paCost)) return;
    const result = completeMission(m, skills);
    setSkills(result.skills);
    setCash((c) => c + m.pay);
    setMissions((list) => list.filter((x) => x.id !== missionId));
    banner("Mission accomplie", `${m.title} : +${f(m.pay)}${result.gained > 0 ? ` · +${result.gained} en ${SKILL_LABELS[m.skill]}` : ""}.`, "good");
  }

  return {
    loaded, view, setView, phase,
    scenarioDraft, goToNewScenario, rerollScenario, startGame,
    profession, day, cash, debts, liabilities, kids, assets, passiveIncome, hasSave, resetGame, nextDay, skipMonth,
    payOffLiability, payOffDebt,
    skipMonthMode, setSkipMonthMode,
    managementThresholdPct, setManagementThresholdPct,
    babyEnabled, setBabyEnabled, layoffEnabled, setLayoffEnabled, layoffMonthsLeft,
    lastEvent, lastSkipReport,
    tokens, portfolio, journal, marketTurn, traderJournalActive,
    onToggleTraderJournal: () => setTraderJournalActive((v) => !v),
    buyStock, sellStock,
    listings, pendingDecision, openListing, skipListing, buyListing,
    payOffLoan, startAmortization, cancelAmortization, payOffAllLoans,
    selectedAssetId, setSelectedAssetId, performAssetMaintenance,
    hireAssetEmployee, fireAssetEmployee, trainAssetEmployee, buyAssetStake,
    casinoHandsPlayed, casinoNetResult, actionPoints,
    onCasinoCashDelta: (amount) => setCash((c) => Math.max(0, c + amount)),
    onCasinoHandPlayed: (netProfit) => { setCasinoHandsPlayed((n) => n + 1); setCasinoNetResult((n) => n + netProfit); },
    currency, setCurrency,
    dailyActionPoints, setDailyActionPoints,
    skills, training, missions, daysWithoutRest, enCouple, lastJobRejectionDay,
    beginTraining, applyToJob, doMission,
  };
}
