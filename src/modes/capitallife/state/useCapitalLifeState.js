import { useState, useEffect, useRef } from "react";
import { storage } from "../../../state/storage.js";
import { computeFinancing, amortizedPayment, calcExpenses, calcPassiveIncome, calcDebtPayments, LIABILITY_LABELS, MAX_DEBT_RATIO } from "../../../engine/financing.js";
import { generateTokens } from "../../../engine/bourse/tokenGenerator.js";
import { BROKERAGE_FEE_RATE, tickMarketDays } from "../../../engine/bourse/market.js";
import { fmt, uid } from "../../../utils/format.js";
import { generateScenario } from "../data/scenarioGenerator.js";
import { simulateDays, WIN_STREAK_TARGET } from "../engine/dayLoop.js";
import { randomCycleDuration, cycleModifiers } from "../engine/economy.js";
import { advanceListings } from "../engine/opportunitySite.js";
import { applyAssetDecisionOption } from "../engine/assetDecisions.js";
import {
  initAssetIndicators, canPerformMaintenance, performMaintenance,
  totalSalaries, hireEmployee, fireEmployee, fireSeverance, trainEmployee, trainingCost, MAX_EMPLOYEES,
  applyStakePurchase, DEFAULT_MANAGEMENT_THRESHOLD_PCT, canRunAd, runAd, payDividend,
  canRenovate, renovate, pickTenant,
  canOpenSecondLocation, openSecondLocation, sellAsset,
} from "../engine/assetIndicators.js";
import { DAILY_ACTION_POINTS, ACTION_COSTS, DIFFICULTY_PRESETS, DEFAULT_DIFFICULTY } from "../engine/actionPoints.js";
import {
  TRAININGS, CAREER_PROGRAMS, startTraining, startCareerProgram, tickTraining, jobRequirementsMet, hasRequiredQualification, rollApplication,
  JOB_APPLY_PA_COST, JOB_REJECTION_COOLDOWN_DAYS, generateMissions, completeMission,
  nextFatigue, rollBurnout, burnoutCost, BURNOUT_LAYOFF_MONTHS, rollDivorce, divorceCost,
} from "../engine/career.js";
import { PROFESSIONS } from "../../../data/professions.js";
import { SKILL_LABELS } from "../../../data/skills.js";
import { DEFAULT_RENT_TIER, rentTierByKey, rentCost, moveCost, MOVE_PA_COST } from "../engine/lifestyle.js";
import { REALTIME_TICK_MS, MAX_REALTIME_CATCHUP_TICKS } from "../engine/economicClock.js";

const SAVE_KEY = "capitallife-save";
const SETTINGS_KEY = "capitallife-settings";

export default function useCapitalLifeState() {
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState("menu"); // menu | scenario | game | trading | opportunities | assets | casino
  const [phase, setPhase] = useState("playing"); // playing | won | bankrupt
  const [scenarioDraft, setScenarioDraft] = useState(null);
  const [scenarioPresetKey, setScenarioPresetKey] = useState("random");
  const [profession, setProfession] = useState(null);
  const [day, setDay] = useState(0);
  const [cash, setCash] = useState(0);
  const [debts, setDebts] = useState([]);
  const [liabilities, setLiabilities] = useState({});
  const [kids, setKids] = useState(0);
  const [assets, setAssets] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [listings, setListings] = useState([]);
  const [opportunityTurn, setOpportunityTurn] = useState(1);
  const [lastRealtimeAt, setLastRealtimeAt] = useState(Date.now());
  const [pendingDecision, setPendingDecision] = useState(null);
  const [assetDecision, setAssetDecision] = useState(null);
  const [lastEvent, setLastEvent] = useState(null);
  const [lastSkipReport, setLastSkipReport] = useState(null);
  const [casinoHandsPlayed, setCasinoHandsPlayed] = useState(0);
  const [casinoNetResult, setCasinoNetResult] = useState(0);
  const [lastCasinoPlayDay, setLastCasinoPlayDay] = useState(null);
  const [actionPoints, setActionPoints] = useState(DAILY_ACTION_POINTS);

  // --- Carrière : compétences, formation, job board, missions freelance,
  // surmenage et statut de couple (cf. engine/career.js).
  const [skills, setSkills] = useState({});
  const [training, setTraining] = useState(null);
  const [qualifications, setQualifications] = useState({});
  const [missions, setMissions] = useState([]);
  const [fatigue, setFatigue] = useState(0);
  const [enCouple, setEnCouple] = useState(false);
  const [lastJobRejectionDay, setLastJobRejectionDay] = useState(null);
  const [rentTier, setRentTierState] = useState(DEFAULT_RENT_TIER);

  const [currency, setCurrency] = useState("EUR");
  const [babyEnabled, setBabyEnabled] = useState(true);
  const [layoffEnabled, setLayoffEnabled] = useState(true);
  const [skipMonthMode, setSkipMonthMode] = useState("auto"); // auto | calm
  const [managementThresholdPct, setManagementThresholdPct] = useState(DEFAULT_MANAGEMENT_THRESHOLD_PCT);
  const [dailyActionPoints, setDailyActionPoints] = useState(DAILY_ACTION_POINTS);
  const [difficulty, setDifficulty] = useState(DEFAULT_DIFFICULTY);
  const [layoffMonthsLeft, setLayoffMonthsLeft] = useState(0);
  const [lastSmallDoodadDay, setLastSmallDoodadDay] = useState(null);
  const [lastBigDoodadDay, setLastBigDoodadDay] = useState(null);
  const [lastBabyDay, setLastBabyDay] = useState(null);
  const [lastLayoffDay, setLastLayoffDay] = useState(null);
  const [luckyUntilDay, setLuckyUntilDay] = useState(0);
  const [lastSeasonalDays, setLastSeasonalDays] = useState({});
  const [consecutiveWinningPaydays, setConsecutiveWinningPaydays] = useState(0);
  const [economicCycle, setEconomicCycle] = useState("growth");
  const [economicCycleUntilDay, setEconomicCycleUntilDay] = useState(0);

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
          if (s.lastCasinoPlayDay !== undefined) setLastCasinoPlayDay(s.lastCasinoPlayDay);
          if (s.actionPoints != null) setActionPoints(s.actionPoints);
          if (Array.isArray(s.debts)) setDebts(s.debts);
          if (s.liabilities) setLiabilities(s.liabilities);
          if (s.kids != null) setKids(s.kids);
          if (Array.isArray(s.assets)) setAssets(s.assets);
          if (Array.isArray(s.listings)) setListings(s.listings);
          if (s.opportunityTurn != null) setOpportunityTurn(s.opportunityTurn);
          else if (s.day != null) setOpportunityTurn(s.day);
          if (s.lastRealtimeAt != null) setLastRealtimeAt(s.lastRealtimeAt);
          if (s.layoffMonthsLeft != null) setLayoffMonthsLeft(s.layoffMonthsLeft);
          if (s.lastSmallDoodadDay !== undefined) setLastSmallDoodadDay(s.lastSmallDoodadDay);
          if (s.lastBigDoodadDay !== undefined) setLastBigDoodadDay(s.lastBigDoodadDay);
          if (s.lastBabyDay !== undefined) setLastBabyDay(s.lastBabyDay);
          if (s.lastLayoffDay !== undefined) setLastLayoffDay(s.lastLayoffDay);
          if (s.luckyUntilDay != null) setLuckyUntilDay(s.luckyUntilDay);
          if (s.lastSeasonalDays) setLastSeasonalDays(s.lastSeasonalDays);
          if (s.consecutiveWinningPaydays != null) setConsecutiveWinningPaydays(s.consecutiveWinningPaydays);
          if (s.economicCycle) setEconomicCycle(s.economicCycle);
          if (s.economicCycleUntilDay != null) setEconomicCycleUntilDay(s.economicCycleUntilDay);
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
          if (s.qualifications) setQualifications(s.qualifications);
          else if (s.profession?.id) setQualifications({ [s.profession.id]: true });
          if (Array.isArray(s.missions)) setMissions(s.missions);
          if (s.fatigue != null) setFatigue(s.fatigue);
          if (s.enCouple !== undefined) setEnCouple(s.enCouple);
          if (s.lastJobRejectionDay !== undefined) setLastJobRejectionDay(s.lastJobRejectionDay);
          if (s.rentTier) setRentTierState(s.rentTier);
          if (s.dailyActionPoints != null) setDailyActionPoints(s.dailyActionPoints);
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
          if (st.difficulty) setDifficulty(st.difficulty);
        }
      } catch (e) { /* pas de réglages existants */ }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded || day === 0) return;
    const s = {
      day, cash, profession, phase, debts, liabilities, kids, assets, listings, opportunityTurn, lastRealtimeAt, layoffMonthsLeft,
      lastSmallDoodadDay, lastBigDoodadDay, lastBabyDay, lastLayoffDay, luckyUntilDay, lastSeasonalDays,
      consecutiveWinningPaydays, economicCycle, economicCycleUntilDay,
      casinoHandsPlayed, casinoNetResult, lastCasinoPlayDay, actionPoints, dailyActionPoints,
      tokens, portfolio, journal, pendingArcs, sectorConditions, economicModifier, traderJournalActive, marketTurn,
      skills, training, qualifications, missions, fatigue, enCouple, lastJobRejectionDay, rentTier,
    };
    storage.set(SAVE_KEY, JSON.stringify(s)).catch(() => {});
  }, [loaded, day, cash, profession, phase, debts, liabilities, kids, assets, listings, opportunityTurn, lastRealtimeAt, layoffMonthsLeft, lastSmallDoodadDay, lastBigDoodadDay, lastBabyDay, lastLayoffDay, luckyUntilDay, lastSeasonalDays, consecutiveWinningPaydays, economicCycle, economicCycleUntilDay, casinoHandsPlayed, casinoNetResult, lastCasinoPlayDay, actionPoints, dailyActionPoints, tokens, portfolio, journal, pendingArcs, sectorConditions, economicModifier, traderJournalActive, marketTurn, skills, training, qualifications, missions, fatigue, enCouple, lastJobRejectionDay, rentTier]);

  useEffect(() => {
    if (!loaded) return;
    const st = { currency, babyEnabled, layoffEnabled, skipMonthMode, managementThresholdPct, difficulty };
    storage.set(SETTINGS_KEY, JSON.stringify(st)).catch(() => {});
  }, [loaded, currency, babyEnabled, layoffEnabled, skipMonthMode, managementThresholdPct, difficulty]);

  // Horloge autonome de la Bourse et d'OppMarket. Elle tourne depuis tous les
  // écrans de la partie et rattrape le temps écoulé lorsque l'application
  // redevient active. Les paies, formations et événements de vie restent liés
  // aux boutons de calendrier : seule l'économie de marché vit en temps réel.
  useEffect(() => {
    if (!loaded || day === 0 || phase !== "playing") return undefined;
    const advanceRealtime = () => {
      const now = Date.now();
      const ticks = Math.min(MAX_REALTIME_CATCHUP_TICKS, Math.floor((now - lastRealtimeAt) / REALTIME_TICK_MS));
      if (ticks <= 0) return;
      const market = tickMarketDays({ tokens, pendingArcs, sectorConditions, economicModifier, marketTurn, traderJournalActive, economicEffectDuration: 10, economicEffectPermanent: false, assets, currency }, ticks);
      let nextListings = listings;
      let nextOpportunityTurn = opportunityTurn;
      let sniped = null;
      for (let i = 0; i < ticks; i++) {
        nextOpportunityTurn += 1;
        const result = advanceListings(nextListings, nextOpportunityTurn, cash, 0, pendingDecision?.listingId || null);
        nextListings = result.listings;
        sniped = sniped || result.sniped;
      }
      setTokens(market.tokens);
      setPendingArcs(market.pendingArcs);
      setSectorConditions(market.sectorConditions);
      setEconomicModifier(market.economicModifier);
      setMarketTurn(market.marketTurn);
      if (market.cashDelta) setCash((value) => Math.max(0, value + market.cashDelta));
      if (market.journalEntries.length) setJournal((items) => [...market.journalEntries.slice().reverse(), ...items].slice(0, 60));
      setListings(nextListings);
      setOpportunityTurn(nextOpportunityTurn);
      setLastRealtimeAt(now);
      if (sniped) banner("Occasion manquée", `« ${sniped} » a été achetée pendant que vous étiez ailleurs.`, "info");
    };
    advanceRealtime();
    const interval = window.setInterval(advanceRealtime, REALTIME_TICK_MS);
    const onVisible = () => { if (document.visibilityState === "visible") advanceRealtime(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { window.clearInterval(interval); document.removeEventListener("visibilitychange", onVisible); };
  }, [loaded, day, phase, lastRealtimeAt, tokens, pendingArcs, sectorConditions, economicModifier, marketTurn, traderJournalActive, assets, currency, listings, opportunityTurn, cash, pendingDecision]);

  const hasSave = loaded && day > 0 && phase !== "won" && phase !== "bankrupt";
  const passiveIncome = calcPassiveIncome(assets);
  const currentDebtPayments = profession ? calcDebtPayments(profession, debts.reduce((s, d) => s + d.monthlyPayment, 0), assets, liabilities) : 0;

  // La victoire n'est plus instantanée (cf. WIN_STREAK_TARGET dans dayLoop.js) :
  // elle se décide dans simulateDays/applySimResult, jamais dans un effet
  // réactif sur chaque rendu — sinon un simple achat qui fait dépasser le
  // seuil un instant déclencherait la victoire sans repasser par un vrai jour
  // de paie.

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
    setScenarioPresetKey("random");
    setScenarioDraft(generateScenario("random"));
    setView("scenario");
  }

  function rerollScenario() {
    setScenarioDraft(generateScenario(scenarioPresetKey));
  }

  function changeScenarioPreset(presetKey) {
    setScenarioPresetKey(presetKey);
    setScenarioDraft(generateScenario(presetKey));
  }

  function startGame() {
    setProfession(scenarioDraft.profession);
    setCash(scenarioDraft.startingCash);
    setPhase("playing");
    setDebts([scenarioDraft.debt]);
    setLiabilities(scenarioDraft.liabilities);
    setKids(scenarioDraft.startingKids || 0);
    setAssets(scenarioDraft.startingAssetHint === "degraded_realestate" ? [{
      id: uid(), name: "Bien hérité (à retaper)", type: "realestate", sector: "immobilier",
      cost: 40000, downPayment: 40000, loanAmount: 0, loanBalance: 0, loanMonthly: 0, annualRate: 0,
      amortizing: false, amortMonths: null,
      grossCashflow: 0, baseGrossCashflow: 0, incomeEffectExpiresTurn: null, cashflow: 0,
      condition: 25 + Math.round(Math.random() * 10), tenant: null,
    }] : []);
    setPendingDecision(null);
    setLastEvent(null);
    setCasinoHandsPlayed(0); setCasinoNetResult(0); setLastCasinoPlayDay(null);
    // Budget de PA verrouillé pour toute la partie, lié à la difficulté
    // choisie sur l'écran précédent — plus un simple réglage libre en cours
    // de route (cf. Options).
    const paForRun = (DIFFICULTY_PRESETS[difficulty] || DIFFICULTY_PRESETS[DEFAULT_DIFFICULTY]).dailyActionPoints;
    setDailyActionPoints(paForRun);
    setActionPoints(paForRun);
    setLayoffMonthsLeft(0);
    setLastSmallDoodadDay(null); setLastBigDoodadDay(null); setLastBabyDay(null); setLastLayoffDay(null);
    setLuckyUntilDay(0);
    setLastSeasonalDays({});
    setConsecutiveWinningPaydays(0);
    setEconomicCycle(scenarioDraft.startingEconomy === "recession" ? "recession" : "growth");
    setEconomicCycleUntilDay(1 + randomCycleDuration());
    lastSmallDoodadCardRef.current = null; lastBigDoodadCardRef.current = null; lastMarketCardRef.current = null;
    setDay(1);

    // Pré-remplit le site d'annonces et le journal des marchés avant le premier
    // geste du joueur — sinon les deux sont vides à l'arrivée sur l'accueil.
    let seedListings = [];
    for (let i = 0; i < 3; i++) seedListings = advanceListings(seedListings, 1, scenarioDraft.startingCash).listings;
    setListings(seedListings);
    setOpportunityTurn(1);
    setLastRealtimeAt(Date.now());

    const warmup = tickMarketDays({
      tokens: generateTokens(16), pendingArcs: [], sectorConditions: {}, economicModifier: { loanRateMult: 1, expiresTurn: 0 },
      marketTurn: 0, traderJournalActive: false, economicEffectDuration: 10, economicEffectPermanent: false, assets: [], currency,
    }, 5);
    setTokens(warmup.tokens);
    setPortfolio({});
    setJournal(warmup.journalEntries.slice().reverse());
    setPendingArcs(warmup.pendingArcs);
    setSectorConditions(warmup.sectorConditions);
    setEconomicModifier(warmup.economicModifier);
    setTraderJournalActive(false);
    setMarketTurn(warmup.marketTurn);
    setSkills({ ...(scenarioDraft.profession.startingSkills || {}) });
    setTraining(null);
    setQualifications({ [scenarioDraft.profession.id]: true });
    setMissions(generateMissions(scenarioDraft.profession.startingSkills || {}));
    setFatigue(0);
    setEnCouple(Math.random() < 0.5);
    setLastJobRejectionDay(null);
    setRentTierState(DEFAULT_RENT_TIER);
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
    setOpportunityTurn(1);
    setLastRealtimeAt(Date.now());
    setSkills({});
    setTraining(null);
    setQualifications({});
    setMissions([]);
    setFatigue(0);
    setEnCouple(false);
    setLastJobRejectionDay(null);
    setRentTierState(DEFAULT_RENT_TIER);
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

  // Information imparfaite : révèle si l'annonce cache un vice (état dégradé
  // à l'achat) — coûte 1 PA, ne change rien au prix, juste à ce qu'on sait
  // avant de signer.
  function inspectListing(listingId) {
    const listing = listings.find((l) => l.id === listingId);
    if (!listing || listing.inspected) return;
    if (!spendActionPoints(ACTION_COSTS.inspectListing)) return;
    setListings((ls) => ls.map((l) => (l.id === listingId ? { ...l, inspected: true } : l)));
    banner("Inspection", listing.flawed ? "Vice caché détecté : ce bien est en moins bon état que le prix ne le laisse penser." : "Rien à signaler : l'affaire est conforme à ce qui est annoncé.", listing.flawed ? "bad" : "good");
  }

  // Négociation : tente de faire baisser l'apport, avec une chance de succès
  // liée à la compétence Vente — un vrai levier plutôt qu'un simple clic
  // gratuit, et un risque que le vendeur se braque et retire l'annonce.
  const NEGOTIATION_DISCOUNT_RANGE = [0.1, 0.18];
  const NEGOTIATION_WALKOUT_CHANCE = 0.15;
  function negotiateListing(listingId) {
    const listing = listings.find((l) => l.id === listingId);
    if (!listing || listing.negotiated || listing.card.type === "stock") return;
    if (!spendActionPoints(ACTION_COSTS.negotiateListing)) return;
    const chance = Math.max(0.25, Math.min(0.75, 0.4 + (skills.vente || 0) * 0.005));
    if (Math.random() < chance) {
      const [lo, hi] = NEGOTIATION_DISCOUNT_RANGE;
      const cut = 1 - (lo + Math.random() * (hi - lo));
      setListings((ls) => ls.map((l) => (l.id === listingId ? {
        ...l, negotiated: true,
        card: { ...l.card, cost: Math.round(l.card.cost * cut), downPayment: l.card.downPayment != null ? Math.round(l.card.downPayment * cut) : undefined },
      } : l)));
      banner("Négociation réussie", `${listing.card.title} : apport réduit d'environ ${Math.round((1 - cut) * 100)}%.`, "good");
    } else if (Math.random() < NEGOTIATION_WALKOUT_CHANCE) {
      setListings((ls) => ls.filter((l) => l.id !== listingId));
      if (pendingDecision?.listingId === listingId) setPendingDecision(null);
      banner("Négociation ratée", `${listing.card.title} : le vendeur se retire de la table.`, "bad");
    } else {
      banner("Négociation refusée", "Le vendeur ne bouge pas sur le prix.", "info");
    }
  }

  function buyListing(card, mode, listingId) {
    const useLoan = mode !== false;
    const loanRateMult = marketTurn < economicModifier.expiresTurn ? economicModifier.loanRateMult : 1;
    const grossCashflow = card.cashflow;
    const fin = useLoan
      ? computeFinancing(card, "realistic", 10, loanRateMult, "realiste", 1)
      : { downPayment: card.cost, loanAmount: 0, loanMonthly: 0, netCashflow: grossCashflow, grossCashflow, annualRate: 0 };
    if (cash < fin.downPayment) return;

    let loanMonthly = fin.loanMonthly, amortizing = false, amortMonths = null;
    if (typeof mode === "number" && fin.loanAmount > 0) {
      loanMonthly = Math.round(amortizedPayment(fin.loanAmount, fin.annualRate, mode / 12));
      amortizing = true; amortMonths = mode;
    }
    const boughtListing = listings.find((l) => l.id === listingId);
    let indicators = initAssetIndicators(card, managementThresholdPct);
    if (boughtListing?.flawed && indicators?.condition != null) {
      indicators = { ...indicators, condition: Math.max(20, indicators.condition - 35) };
    }
    const netCashflow = fin.grossCashflow - loanMonthly - totalSalaries({ employees: indicators?.employees });

    if (useLoan) {
      const currentDebtPayments = calcDebtPayments(profession, debts.reduce((s, d) => s + d.monthlyPayment, 0), assets, liabilities);
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

  // Regroupe toutes les dettes de scénario/imprévu en une seule mensualité
  // plus légère — un vrai outil de redressement (pas gratuit : 10% de frais
  // de consolidation étalés sur une durée plus longue, donc plus d'intérêt
  // total payé au bout du compte).
  const CONSOLIDATION_FEE_RATE = 0.1;
  const CONSOLIDATION_MIN_MONTHS = 24;
  function consolidateDebts() {
    const active = debts.filter((d) => d.balance > 0);
    if (active.length < 2) { banner("Consolidation impossible", "Il faut au moins deux dettes à regrouper.", "info"); return; }
    const totalBalance = active.reduce((s, d) => s + d.balance, 0);
    const months = Math.max(CONSOLIDATION_MIN_MONTHS, ...active.map((d) => d.monthsRemaining));
    const consolidatedTotal = Math.round(totalBalance * (1 + CONSOLIDATION_FEE_RATE));
    const monthlyPayment = Math.max(1, Math.round(consolidatedTotal / months));
    setDebts([{ id: uid(), reason: "Dette consolidée", monthlyPayment, monthsRemaining: months, totalMonths: months, balance: monthlyPayment * months }]);
    banner("Dettes consolidées", `${active.length} dettes regroupées : ${f(monthlyPayment)}/mois sur ${months} mois (au lieu de ${f(active.reduce((s, d) => s + d.monthlyPayment, 0))}/mois).`, "good");
  }

  const PERSONAL_LOAN_ANNUAL_RATE = 0.09;
  function takePersonalLoan(amount, months) {
    const principal = Math.max(1000, Math.min(50000, Math.round(Number(amount) / 1000) * 1000));
    const term = [24, 36, 60].includes(Number(months)) ? Number(months) : 36;
    const monthlyPayment = Math.round(amortizedPayment(principal, PERSONAL_LOAN_ANNUAL_RATE, term / 12));
    const currentDebtPayments = calcDebtPayments(profession, debts.reduce((s, d) => s + d.monthlyPayment, 0), assets, liabilities);
    const income = profession.salary + passiveIncome;
    if (!income || (currentDebtPayments + monthlyPayment) / income > MAX_DEBT_RATIO) {
      banner("Prêt refusé", `La nouvelle mensualité dépasserait ${Math.round(MAX_DEBT_RATIO * 100)}% d'endettement.`, "bad");
      return;
    }
    setCash((c) => c + principal);
    setDebts((list) => [...list, { id: uid(), reason: "Prêt personnel bancaire", principal, annualRate: PERSONAL_LOAN_ANNUAL_RATE, monthlyPayment, monthsRemaining: term, totalMonths: term, balance: monthlyPayment * term }]);
    banner("Prêt accordé", `${f(principal)} versés · ${f(monthlyPayment)}/mois pendant ${term} mois (TAEG simplifié 9%).`, "good");
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

  // Campagne de publicité (business uniquement) : booste la réputation, ce
  // qui remonte la santé globale et donc la dérive de revenu au fil des mois.
  function performAssetAd(assetId) {
    const a = assets.find((x) => x.id === assetId);
    if (!a) return;
    const check = canRunAd(a, day, cash);
    if (!check.ok) { banner("Publicité impossible", check.reason, "info"); return; }
    if (!spendActionPoints(ACTION_COSTS.ad)) return;
    const { asset: updated, cost } = runAd(a, day);
    const history = [{ day, title: "Campagne de publicité", detail: `-${f(cost)}, réputation améliorée.`, tone: "good" }, ...(a.history || [])].slice(0, 8);
    setCash((c) => c - cost);
    setAssets((list) => list.map((x) => (x.id === assetId ? { ...updated, history } : x)));
    banner("Publicité lancée", `${a.name} : -${f(cost)}, réputation améliorée.`, "good");
  }

  // --- Cycle de vie des actifs (rénovation, locataire, second établissement, vente) ---

  function performAssetRenovation(assetId) {
    const a = assets.find((x) => x.id === assetId);
    if (!a) return;
    const check = canRenovate(a, day, cash);
    if (!check.ok) { banner("Rénovation impossible", check.reason, "info"); return; }
    if (!spendActionPoints(ACTION_COSTS.maintenance)) return;
    const { asset: updated, cost } = renovate(a, day);
    const history = [{ day, title: "Rénovation lancée", detail: `-${f(cost)}, remise en location dans quelques jours.`, tone: "good" }, ...(a.history || [])].slice(0, 8);
    setCash((c) => c - cost);
    setAssets((list) => list.map((x) => (x.id === assetId ? { ...updated, history } : x)));
    banner("Rénovation lancée", `${a.name} : -${f(cost)}.`, "good");
  }

  function performPickTenant(assetId, candidate) {
    const a = assets.find((x) => x.id === assetId);
    if (!a || !candidate) return;
    const updated = pickTenant(a, candidate);
    setAssets((list) => list.map((x) => (x.id === assetId ? updated : x)));
    banner("Locataire choisi", `${a.name} : ${candidate.name} (${candidate.profile}), loyer ${f(candidate.proposedRent)}/mois.`, "good");
  }

  function performOpenSecondLocation(assetId) {
    const a = assets.find((x) => x.id === assetId);
    if (!a) return;
    const check = canOpenSecondLocation(a, cash);
    if (!check.ok) { banner("Ouverture impossible", check.reason, "info"); return; }
    if (!spendActionPoints(ACTION_COSTS.buyAsset)) return;
    const { asset: updated, cost } = openSecondLocation(a, day);
    setCash((c) => c - cost);
    setAssets((list) => list.map((x) => (x.id === assetId ? updated : x)));
    banner("Second établissement ouvert", `${a.name} : -${f(cost)}, revenu quasiment doublé (risque d'incident accru).`, "good");
  }

  function performSellAsset(assetId, sale) {
    const a = assets.find((x) => x.id === assetId);
    if (!a) return;
    setCash((c) => c + sale.proceeds);
    setAssets((list) => list.filter((x) => x.id !== assetId));
    banner("Actif vendu", `${a.name} : +${f(sale.proceeds)} net.`, "good");
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
      ? computeFinancing({ cost: addedCost, cashflow: addedGross, type: "business" }, "realistic", 30, loanRateMult, "realiste", 1)
      : { downPayment: addedCost, loanAmount: 0, loanMonthly: 0, annualRate: 0 };
    if (cash < fin.downPayment) { banner("Rachat de parts impossible", "Liquidités insuffisantes pour l'apport.", "info"); return; }
    if (useLoan && (currentDebtPayments + fin.loanMonthly) / Math.max(1, profession.salary + passiveIncome) > MAX_DEBT_RATIO) {
      banner("Rachat de parts refusé", `La nouvelle mensualité dépasserait ${Math.round(MAX_DEBT_RATIO * 100)}% d'endettement.`, "bad");
      return;
    }
    if (!spendActionPoints(ACTION_COSTS.buyAsset)) return;
    const updated = applyStakePurchase(a, { newPct, addedCost, addedGross, loanAmount: fin.loanAmount, loanMonthly: fin.loanMonthly, annualRate: fin.annualRate }, managementThresholdPct);
    setCash((c) => c - fin.downPayment);
    setAssets((list) => list.map((x) => (x.id === assetId ? updated : x)));
    banner("Parts rachetées", `${a.name} : participation portée à ${newPct}% (+${f(addedGross)}/mois).`, "good");
  }

  // Verse tout ou partie de la trésorerie accumulée d'une entreprise dans les
  // liquidités personnelles du joueur — gratuit en PA (c'est une simple
  // décision financière, pas une action de gestion sur le terrain).
  function payAssetDividend(assetId, amount) {
    const a = assets.find((x) => x.id === assetId);
    if (!a || !(a.treasury > 0)) return;
    const { asset: updated, paid } = payDividend(a, amount);
    if (paid <= 0) return;
    setCash((c) => c + paid);
    setAssets((list) => list.map((x) => (x.id === assetId ? updated : x)));
    banner("Dividende versé", `${a.name} : +${f(paid)} depuis la trésorerie de l'entreprise.`, "good");
  }

  function toggleAssetAutoManage(assetId) {
    setAssets((list) => list.map((x) => (x.id === assetId ? { ...x, autoManage: !x.autoManage } : x)));
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
    setOpportunityTurn(result.opportunityTurn);
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
    setLastSeasonalDays(result.lastSeasonalDays);
    setConsecutiveWinningPaydays(result.consecutiveWinningPaydays);
    setEconomicCycle(result.economicCycle);
    setEconomicCycleUntilDay(result.economicCycleUntilDay);
    setActionPoints(dailyActionPoints);
    setAssetDecision(result.pendingAssetDecision || null);
    if (result.bankrupt) setPhase("bankrupt");
    if (result.won) setPhase("won");
    if (result.journalEntries.length) setJournal((j) => [...result.journalEntries.slice().reverse(), ...j].slice(0, 60));
    if (result.events.length === 1) {
      const e = result.events[0];
      banner(e.title, e.detail, e.tone);
    } else if (result.events.length > 1) {
      banner("Résumé de la période", `${result.events.length} événements : ${result.events.map((e) => e.title).join(", ")}`, "info");
    }
    setLastSkipReport(report || null);
  }

  // Résout la décision d'incident en attente (cf. assetDecisions.js) : le
  // temps était arrêté depuis que rollAssetDecision l'a détectée dans
  // simulateDays. Ne fait PAS reprendre automatiquement un "Sauter le mois"
  // interrompu — le joueur relance lui-même l'avancée du temps ensuite.
  function resolveAssetDecision(optionKey) {
    if (!assetDecision) return;
    const asset = assets.find((a) => a.id === assetDecision.assetId);
    if (!asset) { setAssetDecision(null); return; }
    const option = assetDecision.options.find((o) => o.key === optionKey);
    if (option && option.paCost > 0 && !spendActionPoints(option.paCost)) return;
    const { asset: updated, cashDelta, event } = applyAssetDecisionOption(asset, assetDecision.type, optionKey, day, currency);
    const history = event ? [{ day, ...event }, ...(asset.history || [])].slice(0, 8) : asset.history;
    setCash((c) => Math.max(0, c + cashDelta));
    setAssets((list) => list.map((x) => (x.id === asset.id ? { ...updated, history } : x)));
    setAssetDecision(null);
    if (event) banner(event.title, event.detail, event.tone);
  }

  function snapshot() {
    return {
      day, cash, profession, debts, liabilities, kids, assets, listings, opportunityTurn, pausedListingId: pendingDecision?.listingId || null,
      tokens, pendingArcs, sectorConditions, economicModifier, marketTurn, traderJournalActive,
      babyEnabled, layoffEnabled, layoffMonthsLeft,
      lastSmallDoodadDay, lastBigDoodadDay, lastBabyDay, lastLayoffDay, luckyUntilDay,
      lastSeasonalDays, consecutiveWinningPaydays,
      economicCycle, economicCycleUntilDay,
      rentTier,
    };
  }
  const refs = () => ({ small: lastSmallDoodadCardRef, big: lastBigDoodadCardRef, market: lastMarketCardRef });

  // Budget de PA du jour : réglage de base + bonus/malus du train de vie
  // (loyer) - coût de la formation en cours, jamais sous un plancher de 2.
  function effectivePA(trainingPaCost) {
    const paModifier = rentTierByKey(rentTier).paModifier;
    return Math.max(2, dailyActionPoints + paModifier - trainingPaCost);
  }

  // Applique la formation en cours (numDays jours) et régénère les missions
  // freelance pour la période à venir — commun à "Jour suivant" et "Sauter le
  // mois". Retourne le coût en PA/jour de la formation encore active (0 si
  // aucune), pour ajuster le budget de la journée qui commence.
  function tickCareer(numDays) {
    const result = tickTraining(training, skills, numDays);
    setTraining(result.training);
    setSkills(result.skills);
    if (result.completedProfessionId) setQualifications((q) => ({ ...q, [result.completedProfessionId]: true }));
    setMissions(generateMissions(result.skills, 3, cycleModifiers(economicCycle).missionPayMult));
    if (result.completed) banner(result.completedProfessionId ? "Cursus terminé" : "Formation terminée", result.completedProfessionId ? "Votre diplôme est validé." : "Votre compétence a progressé.", "good");
    return result.training ? result.training.paCost : 0;
  }

  function nextDay() {
    // Fatigue : jauge continue (0-100), mesurée sur le % du budget de PA du
    // jour qui s'achève réellement dépensé — jamais un seuil binaire "tout
    // ou rien" (garder volontairement 1 PA de côté ne suffit plus à esquiver
    // tout risque). La redescente prend plusieurs jours, pas un reset
    // instantané au premier jour plus calme.
    const usageRatio = dailyActionPoints > 0 ? Math.max(0, Math.min(1, 1 - actionPoints / dailyActionPoints)) : 0;
    const newFatigue = nextFatigue(fatigue, usageRatio);

    let careerEvent = null;
    let cashAdjust = 0;
    let forcedLayoffMonths = 0;
    if (rollBurnout(newFatigue)) {
      const cost = burnoutCost();
      cashAdjust -= cost;
      forcedLayoffMonths = BURNOUT_LAYOFF_MONTHS;
      careerEvent = { title: "Burnout", detail: `Vous craquez sous la charge de travail : arrêt ${BURNOUT_LAYOFF_MONTHS} mois, -${f(cost)} de frais médicaux/psy.`, tone: "bad" };
    } else if (enCouple && rollDivorce(newFatigue)) {
      const cost = divorceCost(cash);
      cashAdjust -= cost;
      setEnCouple(false);
      careerEvent = { title: "Divorce", detail: `Le rythme a eu raison du couple : -${f(cost)} de règlement.`, tone: "bad" };
    }
    setFatigue(forcedLayoffMonths > 0 ? Math.round(newFatigue / 2) : newFatigue);

    const trainingPaCost = tickCareer(1);

    const snap = snapshot();
    if (forcedLayoffMonths > 0) snap.layoffMonthsLeft = Math.max(snap.layoffMonthsLeft, forcedLayoffMonths);
    if (cashAdjust !== 0) snap.cash = Math.max(0, snap.cash + cashAdjust);

    applySimResult(simulateDays(snap, 1, { quiet: false, currency, refs: refs() }));
    if (careerEvent) banner(careerEvent.title, careerEvent.detail, careerEvent.tone);
    setActionPoints(effectivePA(trainingPaCost));
  }

  // Avance de `numDays` jours d'un coup — brique commune à "Sauter le mois",
  // "Sauter 7 jours" et "Jusqu'à la fin de la formation". S'arrête plus tôt
  // que prévu si une décision d'incident survient en cours de route (cf.
  // pendingAssetDecision dans dayLoop.js) : le rapport reflète alors les
  // jours réellement simulés, pas la demande initiale. Le surmenage ne
  // s'accumule pas pendant un saut (pas de décisions de PA prises jour par
  // jour) — le compteur repart à zéro.
  function performSkip(numDays) {
    const fromDay = day;
    const cashBefore = cash;
    setFatigue(0);
    const result = simulateDays(snapshot(), numDays, { quiet: skipMonthMode === "calm", currency, refs: refs() });
    // Une décision peut interrompre l'accélération. La carrière doit alors
    // progresser du nombre de jours réellement simulés, jamais de la durée
    // initialement demandée (sinon une formation pouvait se terminer alors
    // que le calendrier s'était arrêté sur un incident).
    const daysActuallySkipped = Math.max(0, result.day - fromDay);
    const trainingPaCost = tickCareer(daysActuallySkipped);
    applySimResult(result, {
      mode: skipMonthMode,
      fromDay, toDay: result.day, daysSkipped: daysActuallySkipped,
      cashBefore, cashAfter: result.cash,
      events: result.events, journalEntries: result.journalEntries,
      interrupted: !!result.pendingAssetDecision && result.day - fromDay < numDays,
    });
    setActionPoints(effectivePA(trainingPaCost));
  }

  // Avance jusqu'au premier jour du mois suivant (jamais moins d'un jour).
  function skipMonth() {
    performSkip(30 - ((day - 1) % 30));
  }

  function skipWeek() {
    performSkip(7);
  }

  // Avance jusqu'à la fin de la formation en cours (rien si aucune formation
  // active).
  function skipToTrainingEnd() {
    if (!training || !(training.daysRemaining > 0)) { banner("Rien à sauter", "Aucune formation en cours.", "info"); return; }
    performSkip(training.daysRemaining);
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

  function beginCareerProgram(professionId) {
    if (training) { banner("Cursus impossible", "Une formation est déjà en cours.", "info"); return; }
    if (qualifications[professionId]) return;
    const program = CAREER_PROGRAMS[professionId];
    if (!program || cash < program.cashCost) { banner("Cursus impossible", "Liquidités insuffisantes pour les frais d'inscription.", "info"); return; }
    setCash((c) => c - program.cashCost);
    setTraining(startCareerProgram(professionId));
    banner("Cursus commencé", `${program.label} : ${program.days} jours, -${program.paCost} PA/jour, -${f(program.cashCost)}.`, "good");
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
    if (!hasRequiredQualification(qualifications, professionId)) {
      banner("Candidature impossible", "Le diplôme ou cursus obligatoire n'est pas validé.", "info");
      return;
    }
    if (!spendActionPoints(JOB_APPLY_PA_COST)) return;
    const prof = PROFESSIONS.find((p) => p.id === professionId);
    const result = rollApplication(skills, professionId, cycleModifiers(economicCycle).jobOfferMult);
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

  // --- Train de vie : choix du loyer, qui affecte le budget de PA ---

  function changeRentTier(tierKey) {
    if (tierKey === rentTier) return;
    const cost = moveCost(tierKey, profession.salary);
    if (cash < cost) { banner("Déménagement impossible", "Liquidités insuffisantes pour l'emménagement.", "info"); return; }
    if (!spendActionPoints(MOVE_PA_COST)) return;
    setCash((c) => c - cost);
    setRentTierState(tierKey);
    const tier = rentTierByKey(tierKey);
    banner("Déménagement", `${tier.label} : -${f(cost)} de frais, loyer ${f(rentCost(tierKey, profession.salary))}/mois.`, "good");
  }

  return {
    loaded, view, setView, phase,
    scenarioDraft, scenarioPresetKey, changeScenarioPreset, goToNewScenario, rerollScenario, startGame,
    profession, day, cash, debts, liabilities, kids, assets, passiveIncome, currentDebtPayments, hasSave, resetGame, nextDay, skipMonth,
    skipWeek, skipToTrainingEnd,
    payOffLiability, payOffDebt, consolidateDebts, takePersonalLoan,
    skipMonthMode, setSkipMonthMode,
    managementThresholdPct, setManagementThresholdPct,
    babyEnabled, setBabyEnabled, layoffEnabled, setLayoffEnabled, layoffMonthsLeft,
    lastEvent, lastSkipReport,
    tokens, portfolio, journal, marketTurn, traderJournalActive,
    onToggleTraderJournal: () => setTraderJournalActive((v) => !v),
    buyStock, sellStock,
    listings, opportunityTurn, pendingDecision, openListing, skipListing, buyListing, inspectListing, negotiateListing,
    payOffLoan, startAmortization, cancelAmortization, payOffAllLoans,
    selectedAssetId, setSelectedAssetId, performAssetMaintenance, performAssetAd,
    hireAssetEmployee, fireAssetEmployee, trainAssetEmployee, buyAssetStake,
    payAssetDividend, toggleAssetAutoManage,
    performAssetRenovation, performPickTenant, performOpenSecondLocation, performSellAsset,
    economicModifier, sectorConditions,
    casinoHandsPlayed, casinoNetResult, actionPoints,
    onCasinoCashDelta: (amount) => setCash((c) => Math.max(0, c + amount)),
    // Une session de casino n'était jusqu'ici ni limitée en nombre de mains ni
    // rattachée au temps qui passe — première main de la journée : léger coût
    // en PA (sans bloquer si le budget est déjà à zéro, juste un frein léger).
    onCasinoHandPlayed: (netProfit) => {
      if (lastCasinoPlayDay !== day) {
        setActionPoints((p) => Math.max(0, p - 1));
        setLastCasinoPlayDay(day);
      }
      setCasinoHandsPlayed((n) => n + 1);
      setCasinoNetResult((n) => n + netProfit);
    },
    currency, setCurrency,
    dailyActionPoints,
    difficulty, setDifficulty,
    skills, training, qualifications, missions, fatigue, enCouple, lastJobRejectionDay,
    beginTraining, beginCareerProgram, applyToJob, doMission,
    rentTier, changeRentTier,
    consecutiveWinningPaydays, winStreakTarget: WIN_STREAK_TARGET,
    assetDecision, resolveAssetDecision,
  };
}
