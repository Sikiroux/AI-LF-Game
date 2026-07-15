import { useState, useEffect, useRef } from "react";
import { storage } from "./storage.js";
import { fmt, rand, randNoRepeat, uid } from "../utils/format.js";
import { CURRENCY_ORDER } from "../data/currencies.js";
import { SMALL_DEALS } from "../data/smallDeals.js";
import { BIG_DEALS } from "../data/bigDeals.js";
import { JACKPOT_DEALS } from "../data/jackpotDeals.js";
import { MARKET_CARDS } from "../data/marketCards.js";
import { DOODAD_CARDS } from "../data/doodadCards.js";
import { generateDealDeck } from "../data/proceduralDeals.js";
import { PROFESSIONS } from "../data/professions.js";
import { DREAMS } from "../data/dreams.js";
import { RAT_RACE_SEQUENCE } from "../engine/ratRace.js";
import { FAST_TRACK_SEQUENCE, drawFastDeal } from "../engine/fastTrack.js";
import { generateTokens } from "../engine/bourse/tokenGenerator.js";
import { BROKERAGE_FEE_RATE, tickMarketDays } from "../engine/bourse/market.js";
import { computeFinancing, getYieldMultiplier, amortizedPayment, calcExpenses, calcPassiveIncome, calcDebtPayments, randomizeLiabilities, LIABILITY_LABELS, MAX_DEBT_RATIO, BANK_LOAN_RATE, BANK_LOAN_UNIT } from "../engine/financing.js";
import { aiDecideOpportunity, aiDecideDoodad, aiDecideMarketSell, aiDecideCharity, aiDecideFastBusiness, aiDecideFastCharity, aiRepayBankLoanUnits } from "../engine/aiPlayer.js";

export default function useGameState() {
  const [isDesktop, setIsDesktop] = useState(typeof window !== "undefined" ? window.innerWidth >= 900 : false);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState("menu"); // menu | options | setup | game
  const [phase, setPhase] = useState("ratrace"); // ratrace | fasttrack | won | bankrupt (actif seulement si view === "game")
  const [currency, setCurrency] = useState("EUR");
  const [downPaymentPct, setDownPaymentPct] = useState(10);
  const [customJobs, setCustomJobs] = useState([]);
  const [profession, setProfession] = useState(null);
  const [dream, setDream] = useState(null);
  const [winReason, setWinReason] = useState(null); // 'dream' | 'income'
  const [position, setPosition] = useState(0);
  const [displayPosition, setDisplayPosition] = useState(0);
  const [moving, setMoving] = useState(false);
  const [cash, setCash] = useState(0);
  const [kids, setKids] = useState(0);
  const [assets, setAssets] = useState([]);
  const [liabilities, setLiabilities] = useState({});
  const [extraMonthly, setExtraMonthly] = useState(0);
  const [extraDebtBalance, setExtraDebtBalance] = useState(0);
  const [bankLoanBalance, setBankLoanBalance] = useState(0);
  const [casinoHandsPlayed, setCasinoHandsPlayed] = useState(0);
  const [casinoNetResult, setCasinoNetResult] = useState(0);
  const [charityTurnsLeft, setCharityTurnsLeft] = useState(0);
  const [skipTurns, setSkipTurns] = useState(0);
  const [dice, setDice] = useState([1]);
  const [diceRolling, setDiceRolling] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const [pendingDecision, setPendingDecision] = useState(null);
  const [fastTrack, setFastTrack] = useState(null);
  const [fastDisplayPosition, setFastDisplayPosition] = useState(0);
  const [turnCount, setTurnCount] = useState(0);
  const [marketTurn, setMarketTurn] = useState(0);
  const [tokens, setTokens] = useState(() => generateTokens(16));
  const [pendingArcs, setPendingArcs] = useState([]);
  const [sectorConditions, setSectorConditions] = useState({});
  const [economicModifier, setEconomicModifier] = useState({ loanRateMult: 1, expiresTurn: 0 });
  const [traderJournalActive, setTraderJournalActive] = useState(false);
  const [economicEffectDuration, setEconomicEffectDuration] = useState(10);
  const [economicEffectPermanent, setEconomicEffectPermanent] = useState(false);
  const [bourseEnabled, setBourseEnabled] = useState(true);
  const [casinoEnabled, setCasinoEnabled] = useState(true);
  const [debtRatioEnabled, setDebtRatioEnabled] = useState(true);
  const [proceduralCards, setProceduralCards] = useState(false);
  const [marketIncomeCardsEnabled, setMarketIncomeCardsEnabled] = useState(true);
  const [marketIncomeDurationMode, setMarketIncomeDurationMode] = useState("permanent"); // permanent | temporary
  const [marketIncomeDurationTurns, setMarketIncomeDurationTurns] = useState(10);
  const [activeSmallDeals, setActiveSmallDeals] = useState(SMALL_DEALS);
  const [activeBigDeals, setActiveBigDeals] = useState(BIG_DEALS);
  const [financingMode, setFinancingMode] = useState("simple"); // simple | realistic
  const [yieldMode, setYieldMode] = useState("realiste"); // realiste | cashflow | personnalise
  const [customYieldMultiplier, setCustomYieldMultiplier] = useState(6);
  const [portfolio, setPortfolio] = useState({});
  const [journal, setJournal] = useState([]);

  const [multiplayer, setMultiplayer] = useState(false);
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [hasRolled, setHasRolled] = useState(false);
  const [mpConfigs, setMpConfigs] = useState(null);
  const [mpResults, setMpResults] = useState([]);
  const [mpGameOver, setMpGameOver] = useState(false);
  const [mpWinnerId, setMpWinnerId] = useState(null);
  const [mpEndReason, setMpEndReason] = useState(null); // dream | income | lastStanding | allBankrupt

  const rollTimer = useRef(null);
  const lastSmall = useRef(null);
  const lastBig = useRef(null);
  const lastMarket = useRef(null);
  const lastDoodad = useRef(null);
  const f = (n) => fmt(n, currency);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 900);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await storage.get("cashflow-save");
        if (res && res.value) {
          const s = JSON.parse(res.value);
          setPhase(s.phase); setProfession(s.profession); setDream(s.dream || null); setWinReason(s.winReason || null); setPosition(s.position); setDisplayPosition(s.position || 0);
          setCash(s.cash); setKids(s.kids); setAssets(s.assets);
          if (s.liabilities) setLiabilities(s.liabilities);
          setExtraMonthly(s.extraMonthly); setExtraDebtBalance(s.extraDebtBalance);
          setBankLoanBalance(s.bankLoanBalance || 0);
          setCasinoHandsPlayed(s.casinoHandsPlayed || 0);
          setCasinoNetResult(s.casinoNetResult || 0);
          if (Array.isArray(s.activeSmallDeals) && s.activeSmallDeals.length) setActiveSmallDeals(s.activeSmallDeals);
          if (Array.isArray(s.activeBigDeals) && s.activeBigDeals.length) setActiveBigDeals(s.activeBigDeals);
          setCharityTurnsLeft(s.charityTurnsLeft); setSkipTurns(s.skipTurns || 0);
          setFastTrack(s.fastTrack); setFastDisplayPosition(s.fastTrack ? s.fastTrack.position : 0); setTurnCount(s.turnCount || 0); setMarketTurn(s.marketTurn || 0);
          if (Array.isArray(s.tokens) && s.tokens.length) setTokens(s.tokens);
          if (s.portfolio) {
            const normalized = {};
            Object.entries(s.portfolio).forEach(([sym, val]) => {
              normalized[sym] = typeof val === "number" ? { shares: val, avgCost: null } : val;
            });
            setPortfolio(normalized);
          }
          if (Array.isArray(s.journal)) setJournal(s.journal);
          if (Array.isArray(s.pendingArcs)) setPendingArcs(s.pendingArcs);
          if (s.sectorConditions) setSectorConditions(s.sectorConditions);
          if (s.economicModifier) setEconomicModifier(s.economicModifier);
          if (s.traderJournalActive !== undefined) setTraderJournalActive(s.traderJournalActive);
          if (s.multiplayer) {
            setMultiplayer(true);
            setPlayers(Array.isArray(s.players) ? s.players : []);
            setCurrentPlayerIndex(s.currentPlayerIndex || 0);
            setMpGameOver(!!s.mpGameOver);
            setMpWinnerId(s.mpWinnerId || null);
            setMpEndReason(s.mpEndReason || null);
          }
        }
      } catch (e) { /* pas de sauvegarde existante */ }
      try {
        const res2 = await storage.get("cashflow-settings");
        if (res2 && res2.value) {
          const st = JSON.parse(res2.value);
          if (st.currency) setCurrency(st.currency);
          if (st.downPaymentPct !== undefined) setDownPaymentPct(st.downPaymentPct);
          if (Array.isArray(st.customJobs)) setCustomJobs(st.customJobs);
          if (st.economicEffectDuration !== undefined) setEconomicEffectDuration(st.economicEffectDuration);
          if (st.economicEffectPermanent !== undefined) setEconomicEffectPermanent(st.economicEffectPermanent);
          if (st.bourseEnabled !== undefined) setBourseEnabled(st.bourseEnabled);
          if (st.casinoEnabled !== undefined) setCasinoEnabled(st.casinoEnabled);
          if (st.debtRatioEnabled !== undefined) setDebtRatioEnabled(st.debtRatioEnabled);
          if (st.proceduralCards !== undefined) setProceduralCards(st.proceduralCards);
          if (st.marketIncomeCardsEnabled !== undefined) setMarketIncomeCardsEnabled(st.marketIncomeCardsEnabled);
          if (st.marketIncomeDurationMode) setMarketIncomeDurationMode(st.marketIncomeDurationMode);
          if (st.marketIncomeDurationTurns !== undefined) setMarketIncomeDurationTurns(st.marketIncomeDurationTurns);
          if (st.financingMode) setFinancingMode(st.financingMode);
          if (st.yieldMode) setYieldMode(st.yieldMode);
          if (st.customYieldMultiplier !== undefined) setCustomYieldMultiplier(st.customYieldMultiplier);
        }
      } catch (e) { /* pas de réglages existants */ }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const s = { phase, profession, dream, winReason, position, cash, kids, assets, liabilities, extraMonthly, extraDebtBalance, bankLoanBalance, charityTurnsLeft, skipTurns, fastTrack, turnCount, marketTurn, tokens, portfolio, journal, pendingArcs, sectorConditions, economicModifier, traderJournalActive, activeSmallDeals, activeBigDeals, casinoHandsPlayed, casinoNetResult, multiplayer, players, currentPlayerIndex, mpGameOver, mpWinnerId, mpEndReason };
    storage.set("cashflow-save", JSON.stringify(s)).catch(() => {});
  }, [loaded, phase, profession, dream, winReason, position, cash, kids, assets, liabilities, extraMonthly, extraDebtBalance, bankLoanBalance, charityTurnsLeft, skipTurns, fastTrack, turnCount, marketTurn, tokens, portfolio, journal, pendingArcs, sectorConditions, economicModifier, traderJournalActive, activeSmallDeals, activeBigDeals, casinoHandsPlayed, casinoNetResult, multiplayer, players, currentPlayerIndex, mpGameOver, mpWinnerId, mpEndReason]);

  useEffect(() => {
    if (!loaded) return;
    const st = { currency, downPaymentPct, customJobs, economicEffectDuration, economicEffectPermanent, bourseEnabled, casinoEnabled, debtRatioEnabled, financingMode, yieldMode, customYieldMultiplier, proceduralCards, marketIncomeCardsEnabled, marketIncomeDurationMode, marketIncomeDurationTurns };
    storage.set("cashflow-settings", JSON.stringify(st)).catch(() => {});
  }, [loaded, currency, downPaymentPct, customJobs, economicEffectDuration, economicEffectPermanent, bourseEnabled, casinoEnabled, debtRatioEnabled, financingMode, yieldMode, customYieldMultiplier, proceduralCards, marketIncomeCardsEnabled, marketIncomeDurationMode, marketIncomeDurationTurns]);

  const passiveIncome = profession ? calcPassiveIncome(assets) : 0;
  const bankLoanMonthly = Math.round(bankLoanBalance * BANK_LOAN_RATE);
  const totalExpenses = profession ? calcExpenses(profession, kids, extraMonthly, liabilities) + bankLoanMonthly : 0;
  const totalIncome = profession ? profession.salary + passiveIncome : 0;
  const netCashflow = totalIncome - totalExpenses;
  const currentDebtPayments = profession ? calcDebtPayments(profession, extraMonthly, assets, liabilities) + bankLoanMonthly : 0;
  const hasSave = loaded && !!profession && (multiplayer ? !mpGameOver : (phase !== "won" && phase !== "bankrupt"));

  useEffect(() => {
    if (phase === "ratrace" && profession && totalExpenses > 0 && passiveIncome >= totalExpenses) {
      enterFastTrack();
    }
  }, [passiveIncome, totalExpenses, phase, profession]);

  function cycleCurrency() {
    setCurrency((c) => {
      const i = CURRENCY_ORDER.indexOf(c);
      return CURRENCY_ORDER[(i + 1) % CURRENCY_ORDER.length];
    });
  }

  function startGame(prof, initialKids, chosenDream) {
    setMultiplayer(false);
    setPlayers([]);
    setCurrentPlayerIndex(0);
    setHasRolled(false);
    setMpConfigs(null);
    setMpResults([]);
    setMpGameOver(false);
    setMpWinnerId(null);
    setMpEndReason(null);
    setProfession(prof);
    setDream(chosenDream);
    setWinReason(null);
    setCash(prof.cash);
    setKids(initialKids || 0);
    setAssets([]);
    setLiabilities(randomizeLiabilities(prof));
    setExtraMonthly(0);
    setExtraDebtBalance(0);
    setBankLoanBalance(0);
    setCasinoHandsPlayed(0);
    setCasinoNetResult(0);
    setCharityTurnsLeft(0);
    setSkipTurns(0);
    setPosition(0);
    setDisplayPosition(0);
    setTurnCount(0);
    setMarketTurn(0);
    setTokens(generateTokens(16));
    setPendingArcs([]); setSectorConditions({}); setEconomicModifier({ loanRateMult: 1, expiresTurn: 0 });
    setTraderJournalActive(false); setPortfolio({}); setJournal([]);
    if (proceduralCards) {
      setActiveSmallDeals(generateDealDeck(56, false));
      setActiveBigDeals(generateDealDeck(42, true));
    } else {
      setActiveSmallDeals(SMALL_DEALS);
      setActiveBigDeals(BIG_DEALS);
    }
    setLastEvent({ title: "Bienvenue !", detail: `Vous êtes ${prof.name}. Votre objectif : ${chosenDream.title}. Lancez le dé pour commencer.`, tone: "info" });
    setPhase("ratrace");
    setView("game");
  }

  function enterFastTrack() {
    const buyout = Math.max(500, Math.round(passiveIncome * 100));
    setFastTrack({
      position: 0,
      fastCash: cash,
      fastIncome: buyout,
      targetIncome: buyout + 50000,
      dream,
    });
    setFastDisplayPosition(0);
    setPhase("fasttrack");
    banner("Voie rapide !", `Rachat initial : ${f(buyout)}/tour. But : acheter "${dream.title}" ou atteindre ${f(buyout + 50000)}/tour.`, "good");
  }

  function clearActiveGameState() {
    storage.delete("cashflow-save").catch(() => {});
    setProfession(null); setDream(null); setWinReason(null); setAssets([]); setLiabilities({}); setFastTrack(null);
    setSkipTurns(0); setCharityTurnsLeft(0); setMarketTurn(0); setBankLoanBalance(0);
    setCasinoHandsPlayed(0); setCasinoNetResult(0);
    setPendingDecision(null); setLastEvent(null);
    setTokens(generateTokens(16));
    setPendingArcs([]); setSectorConditions({}); setEconomicModifier({ loanRateMult: 1, expiresTurn: 0 });
    setTraderJournalActive(false);
    setPortfolio({}); setJournal([]);
    setMultiplayer(false); setPlayers([]); setCurrentPlayerIndex(0); setHasRolled(false);
    setMpConfigs(null); setMpResults([]); setMpGameOver(false); setMpWinnerId(null); setMpEndReason(null);
    if (proceduralCards) {
      setActiveSmallDeals(generateDealDeck(56, false));
      setActiveBigDeals(generateDealDeck(42, true));
    } else {
      setActiveSmallDeals(SMALL_DEALS);
      setActiveBigDeals(BIG_DEALS);
    }
  }

  function resetGame() {
    clearActiveGameState();
    setView("setup");
  }

  function goMultiplayerSetup() {
    clearActiveGameState();
    setMultiplayer(true);
    setView("mpsetup");
  }

  function banner(title, detail, tone) {
    setLastEvent({ title, detail, tone });
  }

  // Prêt bancaire officiel : par tranches de 1000, 10%/mois, remboursable volontairement
  // par tranches quand vous avez du cash en trop (contrairement au financement des
  // opportunités, qui ne se solde qu'à la revente du bien).
  function takeBankLoan(units) {
    const amount = Math.max(0, Math.floor(units)) * BANK_LOAN_UNIT;
    if (amount <= 0) return;
    setCash((c) => c + amount);
    setBankLoanBalance((b) => b + amount);
    banner("Prêt bancaire", `+${f(amount)} empruntés. Mensualité : +${f(Math.round(amount * BANK_LOAN_RATE))}/mois.`, "info");
  }
  function repayBankLoan(units) {
    const amount = Math.min(bankLoanBalance, Math.max(0, Math.floor(units)) * BANK_LOAN_UNIT);
    if (amount <= 0 || cash < amount) return;
    setCash((c) => c - amount);
    setBankLoanBalance((b) => b - amount);
    banner("Prêt remboursé", `-${f(amount)} remboursés. Mensualité réduite de ${f(Math.round(amount * BANK_LOAN_RATE))}/mois.`, "good");
  }

  // Fait avancer le marché de N jours d'un coup, indépendamment des tours de jeu.
  // Tout est calculé en local puis appliqué en une seule fois pour rester cohérent
  // sur plusieurs jours d'affilée (chaque jour dépend du prix de clôture précédent).
  function advanceMarket(days) {
    const result = tickMarketDays({ tokens, pendingArcs, sectorConditions, economicModifier, marketTurn, traderJournalActive, economicEffectDuration, economicEffectPermanent, assets, currency }, days);
    setTokens(result.tokens);
    setPendingArcs(result.pendingArcs);
    setSectorConditions(result.sectorConditions);
    setEconomicModifier(result.economicModifier);
    setMarketTurn(result.marketTurn);
    if (result.cashDelta !== 0) setCash((c) => Math.max(0, c + result.cashDelta));
    if (result.journalEntries.length) setJournal((j) => [...result.journalEntries.slice().reverse(), ...j].slice(0, 60));
  }

  // Petit mouvement intrajournalier (swing trading) : prolonge la dernière bougie
  // sans créer un nouveau jour et sans faire avancer les arcs/actualités.
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
    banner("Achat en bourse", `${n} × ${symbol} pour ${f(gross)} + ${f(fee)} de commission`, "good");
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
    banner("Vente en bourse", `${n} × ${symbol} pour ${f(gross)} - ${f(fee)} de commission`, "good");
  }

  // Fait avancer d'un mois les prêts convertis en mensualités classiques (voir "Mes actifs").
  // Les prêts non convertis ne bougent jamais tout seuls, comme dans le vrai jeu.
  function amortizeAssets(assetList) {
    let changed = false;
    const updated = assetList.map((a) => {
      if (!a.amortizing || !(a.loanBalance > 0)) return a;
      const interestPortion = Math.round(a.loanBalance * (a.annualRate / 12));
      let principalPortion = a.loanMonthly - interestPortion;
      if (principalPortion < 0) principalPortion = 0;
      const newBalance = Math.max(0, a.loanBalance - principalPortion);
      changed = true;
      if (newBalance <= 0) {
        return { ...a, loanBalance: 0, loanAmount: 0, loanMonthly: 0, amortizing: false, cashflow: a.grossCashflow };
      }
      return { ...a, loanBalance: newBalance };
    });
    return { updated, changed };
  }

  function payDoodadCash(card) {
    const res = payOrLiquidate(card.amount, card.title);
    if (card.bankLoanAdd) setBankLoanBalance((b) => b + card.bankLoanAdd);
    const loanSuffix = card.bankLoanAdd ? ` + ${f(card.bankLoanAdd)} financés via le prêt bancaire (+${f(Math.round(card.bankLoanAdd * BANK_LOAN_RATE))}/mois)` : "";
    if (res.liquidated.length) {
      banner("Imprévu — vente forcée", `${card.title} (-${f(card.amount)}) : vente de ${res.liquidated.map((l) => l.name).join(", ")}${loanSuffix}`, "bad");
    } else if (res.ok) {
      banner("Imprévu", `${card.title} : -${f(card.amount)}${loanSuffix}`, "bad");
    }
    setPendingDecision(null);
  }
  function financeDoodad(card) {
    const totalAdd = card.amount + (card.bankLoanAdd || 0);
    setBankLoanBalance((b) => b + totalAdd);
    banner("Imprévu financé", `${card.title} : ${f(totalAdd)} ajoutés au prêt bancaire (+${f(Math.round(totalAdd * BANK_LOAN_RATE))}/mois). Remboursable par tranches depuis le Bilan.`, "bad");
    setPendingDecision(null);
  }

  function payPaycheck(curCash, curAssets) {
    const inc = totalIncome - totalExpenses;
    const cc = curCash != null ? curCash : cash;
    let ca = curAssets != null ? curAssets : assets;
    let resultCash, resultAssets = ca;
    if (inc >= 0) {
      resultCash = cc + inc;
      setCash(resultCash);
      banner("Jour de paie", `Revenus - dépenses = ${f(inc)}`, "good");
    } else {
      const res = payOrLiquidate(-inc, "un cashflow négatif", cc, ca);
      resultCash = res.newCash;
      resultAssets = res.newAssets;
      if (res.liquidated.length) {
        banner("Jour de paie — vente forcée", `Cashflow négatif (${f(inc)}) : vente de ${res.liquidated.map((l) => l.name).join(", ")}`, "bad");
      } else if (res.ok) {
        banner("Jour de paie", `Revenus - dépenses = ${f(inc)}`, "bad");
      }
    }
    const { updated, changed } = amortizeAssets(resultAssets);
    if (changed) { setAssets(updated); resultAssets = updated; }
    return { newCash: resultCash, newAssets: resultAssets };
  }

  // Faillite : si les liquidités ne suffisent pas, on revend les actifs à moitié de
  // leur apport initial pour couvrir la dette. Si ça ne suffit toujours pas, faillite.
  // curCash/curAssets permettent de chaîner plusieurs paiements dans le même tour
  // (ex : paie encaissée en passant, puis imprévu sur la case d'arrivée).
  function payOrLiquidate(amount, label, curCash, curAssets) {
    const cc = curCash != null ? curCash : cash;
    const ca = curAssets != null ? curAssets : assets;
    if (cc >= amount) {
      const newCash = cc - amount;
      setCash(newCash);
      return { ok: true, liquidated: [], newCash, newAssets: ca };
    }
    let remaining = amount - cc;
    const kept = [];
    const liquidated = [];
    for (const a of ca) {
      if (remaining <= 0) { kept.push(a); continue; }
      const saleValue = Math.max(0, Math.round((a.downPayment != null ? a.downPayment : a.cost * 0.1) * 0.5));
      remaining -= saleValue;
      liquidated.push({ name: a.name, saleValue });
    }
    setAssets(kept);
    if (remaining > 0) {
      setCash(0);
      setPhase("bankrupt");
      return { ok: false, liquidated, newCash: 0, newAssets: kept };
    }
    const newCash = -remaining;
    setCash(newCash);
    return { ok: true, liquidated, newCash, newAssets: kept };
  }

  function resolveRatSquare(type, curCash, curAssets) {
    switch (type) {
      case "opportunity": {
        if (Math.random() < 0.03) {
          setPendingDecision({ kind: "opportunity", card: { ...rand(JACKPOT_DEALS), jackpot: true } });
          break;
        }
        const isBig = Math.random() < 0.3;
        const deck = isBig ? activeBigDeals : activeSmallDeals;
        const available = deck.filter((c) => {
          const cond = sectorConditions[c.sector];
          return !(cond && cond.kind === "bankrupt" && marketTurn < cond.expiresTurn);
        });
        const card0 = isBig ? randNoRepeat(available.length ? available : deck, lastBig) : randNoRepeat(available.length ? available : deck, lastSmall);
        const cond = sectorConditions[card0.sector];
        let card = card0;
        if (cond && marketTurn < cond.expiresTurn) {
          if (cond.kind === "boom") card = { ...card0, cost: Math.round(card0.cost * 1.3), downPayment: card0.downPayment != null ? Math.round(card0.downPayment * 1.3) : undefined, cashflow: Math.round(card0.cashflow * 1.25), note: "Secteur en plein essor : plus cher, plus rentable." };
          else if (cond.kind === "shortage") card = { ...card0, cost: Math.round(card0.cost * 1.5), downPayment: card0.downPayment != null ? Math.round(card0.downPayment * 1.5) : undefined, cashflow: Math.round(card0.cashflow * 1.15), note: "Pénurie dans ce secteur : prix gonflés." };
          else if (cond.kind === "malus") card = { ...card0, cashflow: Math.round(card0.cashflow * 0.6), note: "Secteur fragilisé : rendement réduit." };
        }
        setPendingDecision({ kind: "opportunity", card });
        break;
      }
      case "doodad": {
        const card = randNoRepeat(DOODAD_CARDS, lastDoodad);
        setPendingDecision({ kind: "doodad", card });
        break;
      }
      case "market": {
        const pool = marketIncomeCardsEnabled ? MARKET_CARDS : MARKET_CARDS.filter((c) => c.effectType !== "income");
        const card = randNoRepeat(pool, lastMarket);
        const matching = assets.filter((a) => a.type === card.assetType);
        if (matching.length === 0) {
          banner("Marché", `${card.title} — vous ne possédez rien de ce type, aucun effet.`, "info");
        } else if (card.effectType === "income") {
          const expiresTurn = marketIncomeDurationMode === "temporary" ? turnCount + marketIncomeDurationTurns : null;
          setAssets((prev) => prev.map((a) => {
            if (a.type !== card.assetType) return a;
            const base = a.baseGrossCashflow != null ? a.baseGrossCashflow : (a.grossCashflow != null ? a.grossCashflow : a.cashflow);
            const newGross = Math.max(0, Math.round(base * card.mult));
            return { ...a, baseGrossCashflow: base, grossCashflow: newGross, incomeEffectExpiresTurn: expiresTurn, cashflow: newGross - (a.loanMonthly || 0) };
          }));
          const pct = Math.round((card.mult - 1) * 100);
          const durationNote = marketIncomeDurationMode === "temporary" ? ` (pendant ${marketIncomeDurationTurns} tours)` : "";
          banner("Marché", `${card.title} — revenu mensuel ${pct >= 0 ? "+" : ""}${pct}%${durationNote} sur vos actifs concernés.`, card.mult >= 1 ? "good" : "bad");
        } else {
          setPendingDecision({ kind: "market", card, matching });
        }
        break;
      }
      case "charity": {
        setPendingDecision({ kind: "charity" });
        break;
      }
      case "baby": {
        if (kids >= 3) {
          banner("Bébé", "Vous avez déjà 3 enfants, aucun effet.", "info");
        } else {
          setKids((k) => k + 1);
          banner("Bébé", `Félicitations ! +${f(profession.perChild)} de dépenses par mois.`, "bad");
        }
        break;
      }
      case "downsized": {
        const due = totalExpenses;
        const res = payOrLiquidate(due, "un licenciement", curCash, curAssets);
        setSkipTurns(2);
        setCharityTurnsLeft(0);
        if (res.liquidated.length) {
          banner("Licencié — vente forcée", `${f(due)} de dépenses : vente de ${res.liquidated.map((l) => l.name).join(", ")}. 2 tours passés.`, "bad");
        } else if (res.ok) {
          banner("Licencié", `Vous payez ${f(due)} de dépenses. 2 tours passés.`, "bad");
        }
        break;
      }
      default: break;
    }
  }

  function resolveFastSquare(type, ft) {
    if (type === "cashflowday") {
      const newCash = ft.fastCash + ft.fastIncome;
      setFastTrack({ ...ft, fastCash: newCash });
      banner("Jour de Cashflow", `+${f(ft.fastIncome)} encaissés.`, "good");
    } else if (type === "business") {
      const deal = drawFastDeal(ft.fastIncome);
      setPendingDecision({ kind: "fastbusiness", card: deal });
    } else if (type === "dream") {
      if (ft.fastCash >= ft.dream.cost) {
        setWinReason("dream");
        setTimeout(() => setPhase("won"), 300);
        banner("Rêve acheté !", ft.dream.title, "good");
      } else {
        banner("Case Rêve", `Pas encore assez de liquidités (${f(ft.fastCash)} / ${f(ft.dream.cost)}).`, "info");
      }
    } else if (type === "taxaudit") {
      const loss = Math.round(ft.fastCash * 0.5);
      setFastTrack({ ...ft, fastCash: ft.fastCash - loss });
      banner("Redressement fiscal", `-${f(loss)} (50% de vos liquidités).`, "bad");
    } else if (type === "lawsuit") {
      const loss = Math.round(ft.fastCash * 0.5);
      setFastTrack({ ...ft, fastCash: ft.fastCash - loss });
      banner("Procès", `-${f(loss)} (50% de vos liquidités).`, "bad");
    } else if (type === "divorce") {
      setFastTrack({ ...ft, fastCash: 0 });
      banner("Divorce", "Vous perdez toutes vos liquidités voie rapide.", "bad");
    } else if (type === "charity") {
      setPendingDecision({ kind: "fastcharity" });
    }
  }

  function buyFastBusiness(deal) {
    setFastTrack((ft) => {
      if (!ft || ft.fastCash < deal.cost) return ft;
      const newIncome = ft.fastIncome + deal.incomeGain;
      const won = newIncome >= ft.targetIncome;
      banner("Entreprise achetée", `${deal.title} : +${f(deal.incomeGain)}/tour`, "good");
      if (won) {
        setWinReason("income");
        setTimeout(() => setPhase("won"), 300);
      }
      return { ...ft, fastCash: ft.fastCash - deal.cost, fastIncome: newIncome };
    });
    setPendingDecision(null);
  }
  function skipFastBusiness(deal) {
    banner("Affaire ignorée", deal.title, "info");
    setPendingDecision(null);
  }
  function resolveFastCharity(give) {
    if (give) {
      setFastTrack((ft) => {
        const donation = Math.round(ft.fastIncome * 0.1);
        banner("Don effectué", `-${f(donation)}. Lancez 3 dés pendant 3 tours.`, "good");
        return { ...ft, fastCash: ft.fastCash - donation };
      });
      setCharityTurnsLeft(3);
    } else {
      banner("Don refusé", "Aucun effet.", "info");
    }
    setPendingDecision(null);
  }

  function rollDice() {
    if (diceRolling || pendingDecision || moving) return;
    if (multiplayer && hasRolled) return;
    if (skipTurns > 0) {
      setSkipTurns((s) => s - 1);
      setHasRolled(true);
      banner("Tour passé", `Conséquence du licenciement (${skipTurns - 1} restant(s)).`, "info");
      return;
    }
    const baseDice = phase === "fasttrack" ? 2 : 1;
    const diceCount = baseDice + (charityTurnsLeft > 0 ? 1 : 0);
    setHasRolled(true);
    setDiceRolling(true);
    let ticks = 0;
    rollTimer.current = setInterval(() => {
      ticks++;
      setDice(Array.from({ length: diceCount }, () => 1 + Math.floor(Math.random() * 6)));
      if (ticks > 8) {
        clearInterval(rollTimer.current);
        const finalDice = Array.from({ length: diceCount }, () => 1 + Math.floor(Math.random() * 6));
        setDice(finalDice);
        const sum = finalDice.reduce((a, b) => a + b, 0);
        setDiceRolling(false);
        const nextTurn = turnCount + 1;
        setTurnCount(nextTurn);
        advanceMarket(1);
        setAssets((prev) => prev.map((a) => {
          if (a.incomeEffectExpiresTurn != null && nextTurn >= a.incomeEffectExpiresTurn && a.baseGrossCashflow != null) {
            return { ...a, grossCashflow: a.baseGrossCashflow, incomeEffectExpiresTurn: null, cashflow: a.baseGrossCashflow - (a.loanMonthly || 0) };
          }
          return a;
        }));
        if (charityTurnsLeft > 0) setCharityTurnsLeft((n) => Math.max(0, n - 1));

        if (phase === "ratrace") {
          const start = position;
          const path = [];
          for (let s = 1; s <= sum; s++) path.push((start + s) % RAT_RACE_SEQUENCE.length);
          setMoving(true);
          let i = 0;
          const stepTimer = setInterval(() => {
            setDisplayPosition(path[i]);
            i++;
            if (i >= path.length) {
              clearInterval(stepTimer);
              const finalPos = path[path.length - 1];
              setPosition(finalPos);
              setMoving(false);
              const passedPayday = path.some((idx) => RAT_RACE_SEQUENCE[idx] === "payday");
              let runningCash = cash;
              let runningAssets = assets;
              if (passedPayday) {
                const res = payPaycheck(runningCash, runningAssets);
                runningCash = res.newCash;
                runningAssets = res.newAssets;
              }
              const finalType = RAT_RACE_SEQUENCE[finalPos];
              if (finalType !== "payday") resolveRatSquare(finalType, runningCash, runningAssets);
            }
          }, 170);
        } else if (phase === "fasttrack") {
          const start = fastTrack.position;
          const path = [];
          for (let s = 1; s <= sum; s++) path.push((start + s) % FAST_TRACK_SEQUENCE.length);
          setMoving(true);
          let i = 0;
          const stepTimer = setInterval(() => {
            setFastDisplayPosition(path[i]);
            i++;
            if (i >= path.length) {
              clearInterval(stepTimer);
              const finalPos = path[path.length - 1];
              setMoving(false);
              setFastTrack((prev) => {
                const next = { ...prev, position: finalPos };
                resolveFastSquare(FAST_TRACK_SEQUENCE[finalPos], next);
                return next;
              });
            }
          }, 170);
        }
      }
    }, 80);
  }

  // Solde d'un coup une des 4 dettes de départ (prêt immo/auto/carte/étudiant).
  // Une fois soldée, sa mensualité fixe cesse de compter dans les dépenses.
  function payOffLiability(key) {
    const balance = liabilities[key];
    if (!(balance > 0) || cash < balance) return;
    setCash((c) => c - balance);
    setLiabilities((l) => ({ ...l, [key]: 0 }));
    banner("Dette remboursée", `${LIABILITY_LABELS[key]} soldé pour ${f(balance)}.`, "good");
  }

  // Rembourse le solde entier d'un actif financé, d'un coup (comme dans le vrai jeu).
  function payOffLoan(assetId) {
    const a = assets.find((x) => x.id === assetId);
    if (!a || !(a.loanBalance > 0)) return;
    if (cash < a.loanBalance) return;
    setCash((c) => c - a.loanBalance);
    setAssets((list) => list.map((x) => (x.id === assetId ? { ...x, loanBalance: 0, loanAmount: 0, loanMonthly: 0, amortizing: false, cashflow: x.grossCashflow } : x)));
    banner("Prêt soldé", `${a.name} : solde de ${f(a.loanBalance)} remboursé d'un coup. Revenu passif rétabli à ${f(a.grossCashflow)}/mois.`, "good");
  }

  // Rembourse d'un coup autant de prêts que les liquidités le permettent (les plus
  // petits soldes en premier, pour en solder le plus possible avant de manquer de cash).
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
      banner("Tout rembourser", "Liquidités insuffisantes pour solder ne serait-ce qu'un seul prêt.", "info");
      return;
    }
    const spent = cash - remaining;
    setCash(remaining);
    setAssets((list) => list.map((x) => (paidIds.includes(x.id) ? { ...x, loanBalance: 0, loanAmount: 0, loanMonthly: 0, amortizing: false, cashflow: x.grossCashflow } : x)));
    banner("Tout rembourser", `${paidIds.length} prêt${paidIds.length > 1 ? "s" : ""} soldé${paidIds.length > 1 ? "s" : ""} pour ${f(spent)}${paidIds.length < owed.length ? " (liquidités insuffisantes pour le reste)" : ""}.`, "good");
  }

  // Convertit un prêt "intérêts seuls" en vrai crédit amorti sur N mois (option avancée).
  function startAmortization(assetId, months) {
    setAssets((list) => list.map((x) => {
      if (x.id !== assetId || !(x.loanBalance > 0)) return x;
      const payment = Math.round(amortizedPayment(x.loanBalance, x.annualRate, months / 12));
      return { ...x, loanMonthly: payment, amortizing: true, amortMonths: months };
    }));
    const a = assets.find((x) => x.id === assetId);
    if (a) banner("Mensualités classiques activées", `${a.name} : remboursement sur ${months} mois.`, "info");
  }
  function cancelAmortization(assetId) {
    setAssets((list) => list.map((x) => {
      if (x.id !== assetId) return x;
      const interestOnly = Math.round(x.loanBalance * (x.annualRate / 12));
      return { ...x, loanMonthly: interestOnly, amortizing: false };
    }));
  }

  function buyAsset(card, mode) {
    // mode: false = comptant, true = financement intérêts seuls, nombre = mensualités classiques sur N mois
    const useLoan = mode !== false;
    const activeLoanMult = marketTurn < economicModifier.expiresTurn ? economicModifier.loanRateMult : 1;
    const grossCashflow = Math.round(card.cashflow * getYieldMultiplier(yieldMode, customYieldMultiplier));
    const fin = useLoan
      ? computeFinancing(card, financingMode, downPaymentPct, activeLoanMult, yieldMode, customYieldMultiplier)
      : { downPayment: card.cost, loanAmount: 0, loanMonthly: 0, netCashflow: grossCashflow, grossCashflow, annualRate: 0 };
    if (cash < fin.downPayment) return;

    let loanMonthly = fin.loanMonthly;
    let amortizing = false;
    let amortMonths = null;
    if (typeof mode === "number" && fin.loanAmount > 0) {
      loanMonthly = Math.round(amortizedPayment(fin.loanAmount, fin.annualRate, mode / 12));
      amortizing = true;
      amortMonths = mode;
    }
    const netCashflow = fin.grossCashflow - loanMonthly;

    if (useLoan && debtRatioEnabled && totalIncome > 0) {
      const ratio = (currentDebtPayments + loanMonthly) / totalIncome;
      if (ratio > MAX_DEBT_RATIO) {
        banner("Emprunt refusé", `Taux d'endettement trop élevé (${Math.round(ratio * 100)}% > ${Math.round(MAX_DEBT_RATIO * 100)}% max).`, "bad");
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
    banner("Achat réalisé", fin.loanAmount > 0 ? `${card.title} : apport ${f(fin.downPayment)}, solde dû ${f(fin.loanAmount)}, net +${f(netCashflow)}/mois` : `${card.title} (comptant) : +${f(netCashflow)}/mois`, "good");
    setPendingDecision(null);
  }
  function skipAsset(card) {
    banner("Occasion ignorée", card.title, "info");
    setPendingDecision(null);
  }
  function resolveMarketSell(card, matching, sell) {
    if (sell) {
      let gain = 0;
      matching.forEach((a) => { gain += a.cost * card.mult - (a.loanBalance != null ? a.loanBalance : (a.loanAmount || 0)); });
      setCash((c) => c + gain);
      setAssets((a) => a.filter((x) => !matching.some((m) => m.id === x.id)));
      banner("Vente conclue", `${gain >= 0 ? "+" : ""}${f(gain)} net (prêt soldé).`, gain >= 0 ? "good" : "bad");
    } else {
      banner("Vente refusée", card.title, "info");
    }
    setPendingDecision(null);
  }
  function resolveCharity(give) {
    if (give) {
      const donation = Math.round(totalIncome * 0.1);
      setCash((c) => c - donation);
      setCharityTurnsLeft(3);
      banner("Don effectué", `-${f(donation)}. Lancez 2 dés pendant 3 tours.`, "good");
    } else {
      banner("Don refusé", "Aucun effet.", "info");
    }
    setPendingDecision(null);
  }

  function buildMpPlayer(cfg, prof, kidsCount, chosenDream) {
    return {
      id: uid(), name: cfg.name, isAI: cfg.isAI, eliminated: false,
      profession: prof, dream: chosenDream, winReason: null,
      position: 0, displayPosition: 0, phase: "ratrace",
      cash: prof.cash, kids: kidsCount || 0, assets: [], liabilities: randomizeLiabilities(prof),
      extraMonthly: 0, extraDebtBalance: 0, bankLoanBalance: 0,
      casinoHandsPlayed: 0, casinoNetResult: 0, charityTurnsLeft: 0, skipTurns: 0,
      fastTrack: null, fastDisplayPosition: 0, portfolio: {}, hasRolled: false,
    };
  }

  function processMpSetup(configs, results) {
    if (results.length >= configs.length) { finalizeMultiplayerGame(results); return; }
    const cfg = configs[results.length];
    if (cfg.isAI) {
      const pool = [...PROFESSIONS, ...customJobs];
      const prof = rand(pool);
      const chosenDream = rand(DREAMS);
      processMpSetup(configs, [...results, buildMpPlayer(cfg, prof, 0, chosenDream)]);
    } else {
      setMpConfigs(configs);
      setMpResults(results);
      setView("setup");
    }
  }

  function beginMultiplayerGame(configs) {
    processMpSetup(configs, []);
  }

  function submitMpHumanSetup(prof, kidsCount, chosenDream) {
    if (!mpConfigs) return;
    const cfg = mpConfigs[mpResults.length];
    processMpSetup(mpConfigs, [...mpResults, buildMpPlayer(cfg, prof, kidsCount, chosenDream)]);
  }

  function loadPlayerIntoActive(p) {
    setProfession(p.profession); setDream(p.dream); setWinReason(p.winReason);
    setPosition(p.position); setDisplayPosition(p.position);
    setCash(p.cash); setKids(p.kids); setAssets(p.assets); setLiabilities(p.liabilities);
    setExtraMonthly(p.extraMonthly); setExtraDebtBalance(p.extraDebtBalance); setBankLoanBalance(p.bankLoanBalance);
    setCasinoHandsPlayed(p.casinoHandsPlayed); setCasinoNetResult(p.casinoNetResult);
    setCharityTurnsLeft(p.charityTurnsLeft); setSkipTurns(p.skipTurns);
    setPhase(p.phase); setFastTrack(p.fastTrack); setFastDisplayPosition(p.fastTrack ? p.fastTrack.position : 0);
    setPortfolio(p.portfolio || {});
    setHasRolled(false);
    setPendingDecision(null); setMoving(false); setDiceRolling(false); setDice([1]);
  }

  function finalizeMultiplayerGame(results) {
    setPlayers(results);
    setCurrentPlayerIndex(0);
    setMpConfigs(null); setMpResults([]);
    loadPlayerIntoActive(results[0]);
    setTurnCount(0); setMarketTurn(0); setTokens(generateTokens(16));
    setPendingArcs([]); setSectorConditions({}); setEconomicModifier({ loanRateMult: 1, expiresTurn: 0 });
    setTraderJournalActive(false); setJournal([]);
    if (proceduralCards) {
      setActiveSmallDeals(generateDealDeck(56, false));
      setActiveBigDeals(generateDealDeck(42, true));
    } else {
      setActiveSmallDeals(SMALL_DEALS);
      setActiveBigDeals(BIG_DEALS);
    }
    setMpGameOver(false); setMpWinnerId(null); setMpEndReason(null);
    setLastEvent({ title: "Bienvenue !", detail: `Partie à ${results.length} joueurs. Premier tour : ${results[0].name}.`, tone: "info" });
    setView("game");
  }

  function computeCurrentSnapshot() {
    const base = players[currentPlayerIndex] || {};
    return {
      ...base, cash, kids, assets, liabilities, extraMonthly, extraDebtBalance, bankLoanBalance,
      casinoHandsPlayed, casinoNetResult, charityTurnsLeft, skipTurns, position, displayPosition,
      phase, fastTrack, fastDisplayPosition, profession, dream, winReason, portfolio, hasRolled,
    };
  }

  // Termine le tour du joueur actif : détecte victoire/faillite, met à jour la liste des
  // joueurs et passe la main au prochain joueur encore en lice (ou déclare la partie finie).
  function finishTurn(overrides) {
    if (!multiplayer || mpGameOver || players.length === 0) return;
    const snapshot = { ...computeCurrentSnapshot(), ...(overrides || {}) };
    const eliminated = snapshot.eliminated || snapshot.phase === "bankrupt";
    const finalSnapshot = { ...snapshot, eliminated };
    const merged = players.map((p, i) => (i === currentPlayerIndex ? finalSnapshot : p));

    if (snapshot.phase === "won") {
      setPlayers(merged);
      setMpGameOver(true);
      setMpWinnerId(finalSnapshot.id);
      setMpEndReason(finalSnapshot.winReason || "income");
      banner("Partie terminée", `${finalSnapshot.name} a gagné !`, "good");
      return;
    }

    const alive = merged.filter((p) => !p.eliminated);
    if (alive.length <= 1) {
      setPlayers(merged);
      setMpGameOver(true);
      setMpWinnerId(alive.length === 1 ? alive[0].id : null);
      setMpEndReason(alive.length === 1 ? "lastStanding" : "allBankrupt");
      banner("Partie terminée", alive.length === 1 ? `${alive[0].name} est le dernier joueur en lice !` : "Tous les joueurs ont fait faillite.", alive.length === 1 ? "good" : "bad");
      return;
    }

    let next = currentPlayerIndex;
    for (let step = 0; step < merged.length; step++) {
      next = (next + 1) % merged.length;
      if (!merged[next].eliminated) break;
    }
    setPlayers(merged);
    setCurrentPlayerIndex(next);
    loadPlayerIntoActive(merged[next]);
    banner(`Au tour de ${merged[next].name}`, merged[next].isAI ? "L'IA va jouer automatiquement." : "À vous de jouer.", "info");
  }

  // Garde la liste des joueurs synchronisée avec l'état "actif" pendant le tour en cours
  // (pour un panneau de statut toujours à jour), sans dupliquer la logique métier.
  useEffect(() => {
    if (!multiplayer || players.length === 0) return;
    setPlayers((ps) => ps.map((p, i) => (i !== currentPlayerIndex ? p : {
      ...p, cash, kids, assets, liabilities, extraMonthly, extraDebtBalance, bankLoanBalance,
      casinoHandsPlayed, casinoNetResult, charityTurnsLeft, skipTurns, position, displayPosition,
      phase, fastTrack, fastDisplayPosition, profession, dream, winReason, portfolio, hasRolled,
    })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [multiplayer, currentPlayerIndex, cash, kids, assets, liabilities, extraMonthly, extraDebtBalance, bankLoanBalance, casinoHandsPlayed, casinoNetResult, charityTurnsLeft, skipTurns, position, displayPosition, phase, fastTrack, fastDisplayPosition, profession, dream, winReason, portfolio, hasRolled]);

  useEffect(() => {
    if (!multiplayer || mpGameOver) return;
    if (phase === "won" || phase === "bankrupt") {
      const t = setTimeout(() => finishTurn(), 1100);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [multiplayer, phase, mpGameOver]);

  function resolveAiDecision(decision) {
    const ctx = {
      cash, totalExpenses, totalIncome, currentDebtPayments, financingMode, downPaymentPct, yieldMode, customYieldMultiplier,
      loanRateMult: marketTurn < economicModifier.expiresTurn ? economicModifier.loanRateMult : 1,
      debtRatioEnabled, fastCash: fastTrack ? fastTrack.fastCash : 0, fastIncome: fastTrack ? fastTrack.fastIncome : 0, bankLoanBalance,
    };
    switch (decision.kind) {
      case "opportunity": {
        const d = aiDecideOpportunity(decision.card, ctx);
        if (d.buy) buyAsset(decision.card, d.mode); else skipAsset(decision.card);
        break;
      }
      case "doodad": {
        const d = aiDecideDoodad(decision.card, ctx);
        if (d.finance) financeDoodad(decision.card); else payDoodadCash(decision.card);
        break;
      }
      case "market": {
        const d = aiDecideMarketSell(decision.card);
        resolveMarketSell(decision.card, decision.matching, d.sell);
        break;
      }
      case "charity": {
        const d = aiDecideCharity(ctx);
        resolveCharity(d.give);
        break;
      }
      case "fastbusiness": {
        const d = aiDecideFastBusiness(decision.card, ctx);
        if (d.buy) buyFastBusiness(decision.card); else skipFastBusiness(decision.card);
        break;
      }
      case "fastcharity": {
        const d = aiDecideFastCharity(ctx);
        resolveFastCharity(d.give);
        break;
      }
      default: setPendingDecision(null);
    }
  }

  // Petite gestion de trésorerie de l'IA en fin de tour : elle rembourse le prêt bancaire
  // si elle a du cash qui dort au-delà de sa réserve de sécurité.
  function computeAiIdleOverrides() {
    const units = aiRepayBankLoanUnits({ cash, totalExpenses, bankLoanBalance });
    if (units <= 0) return {};
    const amount = units * BANK_LOAN_UNIT;
    banner("Prêt remboursé (IA)", `-${f(amount)} remboursés automatiquement.`, "good");
    return { cash: cash - amount, bankLoanBalance: bankLoanBalance - amount };
  }

  // Automatise le tour du joueur actif quand c'est une IA : lance le dé, tranche les
  // décisions selon l'heuristique, puis termine son tour, avec un léger délai entre
  // chaque étape pour que ce soit lisible à l'écran.
  useEffect(() => {
    if (!multiplayer || mpGameOver || view !== "game") return;
    const p = players[currentPlayerIndex];
    if (!p || !p.isAI) return;
    if (diceRolling || moving) return;
    if (phase === "won" || phase === "bankrupt") return;

    const delay = pendingDecision ? 1100 : 900;
    const t = setTimeout(() => {
      if (pendingDecision) {
        resolveAiDecision(pendingDecision);
      } else if (!hasRolled) {
        rollDice();
      } else {
        finishTurn(computeAiIdleOverrides());
      }
    }, delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [multiplayer, mpGameOver, view, currentPlayerIndex, phase, pendingDecision, diceRolling, moving, hasRolled]);

  return {
    isDesktop, setIsDesktop,
    loaded,
    view, setView,
    phase, setPhase,
    currency, setCurrency,
    downPaymentPct, setDownPaymentPct,
    customJobs, setCustomJobs,
    profession, setProfession,
    dream, setDream,
    winReason, setWinReason,
    position, setPosition,
    displayPosition, setDisplayPosition,
    moving, setMoving,
    cash, setCash,
    kids, setKids,
    assets, setAssets,
    liabilities, setLiabilities,
    extraMonthly, setExtraMonthly,
    extraDebtBalance, setExtraDebtBalance,
    bankLoanBalance, setBankLoanBalance,
    casinoHandsPlayed, setCasinoHandsPlayed,
    casinoNetResult, setCasinoNetResult,
    charityTurnsLeft, setCharityTurnsLeft,
    skipTurns, setSkipTurns,
    dice, setDice,
    diceRolling, setDiceRolling,
    lastEvent, setLastEvent,
    pendingDecision, setPendingDecision,
    fastTrack, setFastTrack,
    fastDisplayPosition, setFastDisplayPosition,
    turnCount, setTurnCount,
    marketTurn, setMarketTurn,
    tokens, setTokens,
    pendingArcs, setPendingArcs,
    sectorConditions, setSectorConditions,
    economicModifier, setEconomicModifier,
    traderJournalActive, setTraderJournalActive,
    economicEffectDuration, setEconomicEffectDuration,
    economicEffectPermanent, setEconomicEffectPermanent,
    bourseEnabled, setBourseEnabled,
    casinoEnabled, setCasinoEnabled,
    debtRatioEnabled, setDebtRatioEnabled,
    proceduralCards, setProceduralCards,
    marketIncomeCardsEnabled, setMarketIncomeCardsEnabled,
    marketIncomeDurationMode, setMarketIncomeDurationMode,
    marketIncomeDurationTurns, setMarketIncomeDurationTurns,
    activeSmallDeals, setActiveSmallDeals,
    activeBigDeals, setActiveBigDeals,
    financingMode, setFinancingMode,
    yieldMode, setYieldMode,
    customYieldMultiplier, setCustomYieldMultiplier,
    portfolio, setPortfolio,
    journal, setJournal,

    multiplayer, players, currentPlayerIndex, hasRolled,
    mpConfigs, mpResults, mpGameOver, mpWinnerId, mpEndReason,

    passiveIncome, totalExpenses, totalIncome, netCashflow, currentDebtPayments, hasSave,

    cycleCurrency,
    startGame,
    enterFastTrack,
    resetGame,
    goMultiplayerSetup,
    beginMultiplayerGame,
    submitMpHumanSetup,
    finishTurn,
    banner,
    takeBankLoan,
    repayBankLoan,
    advanceMarket,
    buyStock,
    sellStock,
    amortizeAssets,
    payDoodadCash,
    financeDoodad,
    payPaycheck,
    payOrLiquidate,
    resolveRatSquare,
    resolveFastSquare,
    buyFastBusiness,
    skipFastBusiness,
    resolveFastCharity,
    rollDice,
    payOffLiability,
    payOffLoan,
    payOffAllLoans,
    startAmortization,
    cancelAmortization,
    buyAsset,
    skipAsset,
    resolveMarketSell,
    resolveCharity,
  };
}
