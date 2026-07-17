import { fmt, randNoRepeat, uid } from "../../../utils/format.js";
import { MARKET_CARDS } from "../../../data/marketCards.js";
import { calcExpenses, calcPassiveIncome } from "../../../engine/financing.js";
import { amortizeCapitalLifeLiabilities } from "./liabilities.js";
import { tickMarketDays } from "../../../engine/bourse/market.js";
import { advanceListings } from "./opportunitySite.js";
import { driftAssetIndicators, totalSalaries, businessTreasuryRetention, autoManageBusiness } from "./assetIndicators.js";
import { rollAssetEvent, applyAssetEvent } from "./assetEvents.js";
import { rollAssetDecision, applyAssetDecisionOption } from "./assetDecisions.js";
import {
  SMALL_DOODAD_CARDS, BIG_DOODAD_CARDS, BIG_DOODAD_TERM_MONTHS,
  incomeRatio, scaleDoodadAmount, buildDailyEventTable, rollDailyEvent,
} from "./dailyEvents.js";
import { rollSeasonalEvent } from "./seasonalEvents.js";
import { rentCost } from "./lifestyle.js";
import { nextCycle, cycleModifiers, randomCycleDuration, CYCLE_LABELS } from "./economy.js";
import { ECONOMY_TICKS_PER_GAME_DAY } from "./economicClock.js";

// Victoire durable : atteindre le seuil d'indépendance financière une seule
// fois peut être un effet de bord temporaire (bonne nouvelle sur un actif,
// mois exceptionnel...). On exige plusieurs jours de paie consécutifs où le
// revenu passif couvre les dépenses ET où le joueur garde une vraie réserve
// de liquidités (pas juste "sur le papier") avant de déclarer la victoire.
export const WIN_STREAK_TARGET = 3;
const WIN_RESERVE_MONTHS = 2;

// "Gestion prudente" (ex "mois calme") : jusqu'ici ce mode désactivait
// purement et simplement tous les incidents d'actifs ET tous les événements
// de vie, ce qui en faisait un mode strictement supérieur au jeu normal —
// aucun risque, tout le revenu. Ça reste un mode qui limite le risque
// (probabilité d'incident réduite, décisions résolues automatiquement sans
// interrompre le temps), mais plus un mode "aucune conséquence" : les
// événements peuvent toujours survenir, avec une fréquence amortie des deux
// côtés (bons comme mauvais), et les événements calendaires (rentrée, Noël)
// tombent toujours, prudent ou non.
const PRUDENT_EVENT_CHANCE = 0.55;

// Frais mensuels de gestion automatique (salaire de gestionnaire implicite),
// en % du cash-flow brut de l'entreprise concernée.
const AUTO_MANAGE_FEE_RATE = 0.05;

// Choisit l'option la plus "sûre" d'une décision d'incident pour la
// résolution automatique en gestion prudente : la première option gratuite
// en PA (généralement la plus passive/sans risque immédiat), sinon la
// dernière option de la liste à défaut.
function pickPrudentOption(decision) {
  return decision.options.find((o) => o.paCost === 0) || decision.options[decision.options.length - 1];
}

// Faillite : quand les liquidités ne suffisent pas à couvrir un paiement (loyer,
// imprévu, jour de paie...), on liquide en urgence les actifs les moins
// équitables d'abord (à moitié de leur équity, cost - solde du prêt) jusqu'à
// couvrir le trou. Si même vendre tous les actifs ne suffit pas, faillite —
// même principe que `payOrLiquidate` en mode classique (useGameState.js).
function liquidateForShortfall(assets, shortfall) {
  const equity = (a) => a.cost - (a.loanBalance || 0);
  const sorted = [...assets].sort((a, b) => equity(a) - equity(b));
  let remaining = shortfall;
  const liquidated = [];
  const soldIds = new Set();
  for (const a of sorted) {
    if (remaining <= 0) break;
    const saleValue = Math.max(0, Math.round(equity(a) * 0.5));
    liquidated.push({ name: a.name, saleValue });
    soldIds.add(a.id);
    remaining -= saleValue;
  }
  const kept = assets.filter((a) => !soldIds.has(a.id));
  const totalRaised = liquidated.reduce((s, l) => s + l.saleValue, 0);
  return { assets: kept, liquidated, totalRaised, covered: remaining <= 0, remaining: Math.max(0, remaining) };
}

// Ligne de crédit d'urgence : dernier filet avant la faillite définitive,
// quand même liquider tous les actifs vendables ne suffit pas. Plafonnée (pas
// un joker illimité) et à un taux punitif — un vrai dépannage, pas une
// stratégie viable à répéter.
const EMERGENCY_CREDIT_CAP_MONTHS = 3;
const EMERGENCY_CREDIT_SURCHARGE = 0.35;
const EMERGENCY_CREDIT_TERM_MONTHS = 18;

function drawEmergencyCredit(missing, monthlyExpenseEstimate) {
  const cap = Math.round(Math.max(1, monthlyExpenseEstimate) * EMERGENCY_CREDIT_CAP_MONTHS);
  const drawn = Math.min(missing, cap);
  if (drawn <= 0) return null;
  const owed = Math.round(drawn * (1 + EMERGENCY_CREDIT_SURCHARGE));
  const monthlyPayment = Math.max(1, Math.round(owed / EMERGENCY_CREDIT_TERM_MONTHS));
  return {
    drawn,
    debt: { id: uid(), reason: "Ligne de crédit d'urgence", monthlyPayment, monthsRemaining: EMERGENCY_CREDIT_TERM_MONTHS, totalMonths: EMERGENCY_CREDIT_TERM_MONTHS, balance: monthlyPayment * EMERGENCY_CREDIT_TERM_MONTHS },
  };
}

function amortizeAssetsList(assetList) {
  return assetList.map((a) => {
    if (!a.amortizing || !(a.loanBalance > 0)) return a;
    const interestPortion = Math.round(a.loanBalance * (a.annualRate / 12));
    let principalPortion = a.loanMonthly - interestPortion;
    if (principalPortion < 0) principalPortion = 0;
    const newBalance = Math.max(0, a.loanBalance - principalPortion);
    if (newBalance <= 0) return { ...a, loanBalance: 0, loanAmount: 0, loanMonthly: 0, amortizing: false, cashflow: a.grossCashflow - totalSalaries(a) };
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
    day, cash, profession, debts, liabilities, kids, assets, listings, opportunityTurn = day, pausedListingId = null,
    tokens, pendingArcs, sectorConditions, economicModifier, marketTurn, traderJournalActive,
    babyEnabled, layoffEnabled, layoffMonthsLeft,
    lastSmallDoodadDay, lastBigDoodadDay, lastBabyDay, lastLayoffDay, luckyUntilDay,
    lastSeasonalDays, consecutiveWinningPaydays,
    economicCycle, economicCycleUntilDay,
  } = state;
  lastSeasonalDays = { ...(lastSeasonalDays || {}) };
  consecutiveWinningPaydays = consecutiveWinningPaydays || 0;
  economicCycle = economicCycle || "growth";
  economicCycleUntilDay = economicCycleUntilDay || (day + randomCycleDuration());

  const events = [];
  const journalEntries = [];
  let won = false;
  let pendingAssetDecision = null;
  let bankrupt = false;
  let expiredListings = 0;
  let snipedListings = 0;

  for (let i = 0; i < numDays; i++) {
    const nd = day + 1;

    // Cycle économique global : expansion → croissance → inflation →
    // ralentissement → récession → reprise → expansion, en boucle. Diffusé
    // au marché de l'emploi, aux entreprises et au site d'opportunités —
    // pour que ces systèmes évoluent ensemble plutôt que chacun dans son coin.
    if (nd >= economicCycleUntilDay) {
      economicCycle = nextCycle(economicCycle);
      economicCycleUntilDay = nd + randomCycleDuration();
      events.push({ title: "Conjoncture économique", detail: `L'économie entre en phase de "${CYCLE_LABELS[economicCycle]}".`, tone: economicCycle === "recession" || economicCycle === "slowdown" ? "bad" : "good" });
    }
    const cycleMods = cycleModifiers(economicCycle);

    const tick = tickMarketDays({ tokens, pendingArcs, sectorConditions, economicModifier, marketTurn, traderJournalActive, economicEffectDuration: 10, economicEffectPermanent: false, assets, currency }, ECONOMY_TICKS_PER_GAME_DAY);
    tokens = tick.tokens; pendingArcs = tick.pendingArcs; sectorConditions = tick.sectorConditions;
    economicModifier = tick.economicModifier; marketTurn = tick.marketTurn;
    let cashDelta = tick.cashDelta;
    if (tick.journalEntries.length) journalEntries.push(...tick.journalEntries);

    for (let marketTick = 0; marketTick < ECONOMY_TICKS_PER_GAME_DAY; marketTick++) {
      opportunityTurn += 1;
      const listingResult = advanceListings(listings, opportunityTurn, cash, cycleMods.urgentListingBonus, pausedListingId);
      listings = listingResult.listings;
      expiredListings += listingResult.expiredCount || 0;
      if (listingResult.sniped) snipedListings += 1;
    }

    // Restaure le revenu des actifs dont l'effet temporaire (vacance locative,
    // baisse de fréquentation) est arrivé à expiration.
    assets = assets.map((a) => {
      if (a.incomeEffectExpiresDay != null && nd >= a.incomeEffectExpiresDay && a.baseGrossCashflow != null) {
        return { ...a, grossCashflow: a.baseGrossCashflow, incomeEffectExpiresDay: null, cashflow: a.baseGrossCashflow - (a.loanMonthly || 0) - totalSalaries(a) };
      }
      return a;
    });

    // Incidents importants (panne, vacance, baisse de fréquentation, contrôle
    // fiscal) : au lieu d'un effet automatique, ils ouvrent une décision à
    // plusieurs options. En résolution normale, on arrête d'avancer le temps
    // (même en plein "Sauter le mois") jusqu'à ce que le joueur choisisse,
    // exactement comme pour une faillite. En gestion prudente, l'option la
    // plus sûre est choisie automatiquement, sans interrompre le temps.
    if (!pendingAssetDecision) {
      for (const a of assets) {
        const decision = rollAssetDecision(a, nd);
        if (!decision) continue;
        if (quiet) {
          const option = pickPrudentOption(decision);
          const result = applyAssetDecisionOption(a, decision.type, option.key, nd, currency);
          cashDelta += result.cashDelta;
          if (result.event) events.push(result.event);
          const history = result.event ? [{ day: nd, ...result.event }, ...(a.history || [])].slice(0, 8) : a.history;
          assets = assets.map((x) => (x.id === a.id ? { ...result.asset, history } : x));
        } else {
          pendingAssetDecision = decision;
        }
        break;
      }
    }

    if (!pendingAssetDecision && (!quiet || Math.random() < PRUDENT_EVENT_CHANCE)) {
      assets = assets.map((a) => {
        const type = rollAssetEvent(a, nd);
        if (!type) return a;
        const result = applyAssetEvent(a, type, nd, currency);
        cashDelta += result.cashDelta;
        if (result.event) events.push(result.event);
        const history = result.event ? [{ day: nd, ...result.event }, ...(result.asset.history || [])].slice(0, 8) : result.asset.history;
        return { ...result.asset, history };
      });
    }

    if (!quiet || Math.random() < PRUDENT_EVENT_CHANCE) {
      const lucky = nd < luckyUntilDay;
      const table = buildDailyEventTable({ profession, day: nd, kids, babyEnabled, layoffEnabled, layoffMonthsLeft, lastSmallDoodadDay, lastBigDoodadDay, lastBabyDay, lastLayoffDay, lucky, layoffMult: cycleMods.layoffMult });
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
            // Si un effet temporaire d'actif est en cours (vacance locative, baisse
            // de fréquentation), on met à jour la référence permanente sans écraser
            // le revenu réduit affiché maintenant — il sera restauré vers cette
            // nouvelle base à l'expiration de l'effet temporaire.
            if (a.incomeEffectExpiresDay != null) return { ...a, baseGrossCashflow: newGross };
            return { ...a, baseGrossCashflow: newGross, grossCashflow: newGross, cashflow: newGross - (a.loanMonthly || 0) - totalSalaries(a) };
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

    // Toujours évalué, prudent ou non : ce sont des échéances calendaires
    // prévisibles (rentrée, Noël), pas un risque à amortir.
    const seasonal = rollSeasonalEvent({ day: nd, profession, kids, lastSeasonalDays, currency, fmt });
    if (seasonal) {
      cashDelta -= seasonal.amount;
      lastSeasonalDays[seasonal.id] = nd;
      events.push(seasonal.event);
    }

    // Pilote automatique des entreprises : entretien/publicité déclenchés tout
    // seuls et financés par la trésorerie de l'entreprise, indépendamment du
    // mode "mois calme" (ce n'est pas un événement de vie du joueur, c'est la
    // boîte qui se gère elle-même).
    assets = assets.map((a) => {
      const { asset: managed, actions } = autoManageBusiness(a, nd);
      if (actions.length === 0) return managed;
      const history = actions.map((act) => ({
        day: nd,
        title: act.kind === "maintenance" ? "Entretien automatique" : "Publicité automatique",
        detail: `-${fmt(act.cost, currency)} (trésorerie), ${act.kind === "maintenance" ? "état" : "réputation"} améliorée.`,
        tone: "good",
      }));
      return { ...managed, history: [...history.reverse(), ...(managed.history || [])].slice(0, 8) };
    });

    let payday = 0;
    const isPayday = (nd - 1) % 30 === 0;
    let paydayExpenses = 0;
    let paydayPassiveIncome = 0;
    if (isPayday) {
      const debtMonthly = debts.reduce((s, deb) => s + deb.monthlyPayment, 0);
      const rent = state.rentTier ? rentCost(state.rentTier, profession.salary) : 0;
      const expenses = calcExpenses(profession, kids, debtMonthly, liabilities) + rent;
      const salary = layoffMonthsLeft > 0 ? 0 : profession.salary;
      const passiveIncome = calcPassiveIncome(assets);
      paydayExpenses = expenses;
      paydayPassiveIncome = passiveIncome;
      // Une part du cash-flow des entreprises reste dans leur trésorerie plutôt
      // que de tomber directement dans les liquidités du joueur (cf. dividendes) —
      // n'affecte que ce qui arrive réellement en cash ce mois-ci, pas le revenu
      // passif compté pour l'indépendance financière (calcPassiveIncome ci-dessus).
      const treasuryRetained = assets.reduce((s, a) => s + businessTreasuryRetention(a), 0);
      if (treasuryRetained > 0) {
        assets = assets.map((a) => {
          const retained = businessTreasuryRetention(a);
          return retained > 0 ? { ...a, treasury: (a.treasury || 0) + retained } : a;
        });
      }
      // La gestion automatique n'était jusqu'ici qu'un avantage sans
      // contrepartie (entretien/pub gratuits tant que la trésorerie suit) —
      // un vrai gestionnaire coûte un salaire : prélevé sur la trésorerie de
      // l'entreprise en priorité, sur les liquidités personnelles sinon.
      let autoManageFeesFromCash = 0;
      assets = assets.map((a) => {
        if (a.type !== "business" || !a.autoManage) return a;
        const fee = Math.round((a.grossCashflow || 0) * AUTO_MANAGE_FEE_RATE);
        if (fee <= 0) return a;
        const fromTreasury = Math.min(a.treasury || 0, fee);
        autoManageFeesFromCash += fee - fromTreasury;
        return { ...a, treasury: (a.treasury || 0) - fromTreasury };
      });
      payday = salary + passiveIncome - expenses - treasuryRetained - autoManageFeesFromCash;
      debts = debts.map((deb) => {
        const monthsRemaining = deb.monthsRemaining - 1;
        if (monthsRemaining <= 0) return null;
        return { ...deb, monthsRemaining, balance: deb.monthlyPayment * monthsRemaining };
      }).filter(Boolean);
      liabilities = amortizeCapitalLifeLiabilities(profession, liabilities);
      if (layoffMonthsLeft > 0) layoffMonthsLeft = Math.max(0, layoffMonthsLeft - 1);
      assets = amortizeAssetsList(assets).map((a) => driftAssetIndicators(a, cycleMods.businessGrowthMult));
      const paydayNotes = [];
      if (treasuryRetained > 0) paydayNotes.push(`${fmt(treasuryRetained, currency)} conservés en trésorerie d'entreprise`);
      if (autoManageFeesFromCash > 0) paydayNotes.push(`${fmt(autoManageFeesFromCash, currency)} de frais de gestion automatique`);
      events.push({ title: "Jour de paie", detail: `Salaire + revenus passifs - dépenses = ${payday >= 0 ? "+" : ""}${fmt(payday, currency)}${paydayNotes.length ? ` (dont ${paydayNotes.join(", ")})` : ""}`, tone: payday >= 0 ? "good" : "bad" });
    }

    const rawCash = cash + cashDelta + payday;
    if (rawCash < 0) {
      const { assets: keptAssets, liquidated, totalRaised, covered, remaining } = liquidateForShortfall(assets, -rawCash);
      assets = keptAssets;
      if (liquidated.length > 0) {
        events.push({
          title: "Liquidation forcée",
          detail: `Liquidités insuffisantes : ${liquidated.map((l) => l.name).join(", ")} revendu${liquidated.length > 1 ? "s" : ""} en urgence (+${fmt(totalRaised, currency)}).`,
          tone: "bad",
        });
      }
      if (!covered) {
        // Dernier recours avant la faillite définitive : une ligne de crédit
        // d'urgence plafonnée, à taux punitif — pas un joker illimité, juste
        // de quoi éviter qu'un incident isolé ne mette fin à la partie.
        const debtMonthlyNow = debts.reduce((s, deb) => s + deb.monthlyPayment, 0);
        const rentNow = state.rentTier ? rentCost(state.rentTier, profession.salary) : 0;
        const expenseEstimate = calcExpenses(profession, kids, debtMonthlyNow, liabilities) + rentNow;
        const credit = drawEmergencyCredit(remaining, expenseEstimate);
        if (credit) {
          debts = [...debts, credit.debt];
          events.push({
            title: "Ligne de crédit d'urgence",
            detail: `${fmt(credit.drawn, currency)} empruntés en urgence : -${fmt(credit.debt.monthlyPayment, currency)}/mois pendant ${EMERGENCY_CREDIT_TERM_MONTHS} mois.`,
            tone: "bad",
          });
        }
        const stillMissing = remaining - (credit ? credit.drawn : 0);
        if (stillMissing > 0) {
          cash = 0;
          day = nd;
          bankrupt = true;
          break;
        }
        cash = rawCash + totalRaised + (credit ? credit.drawn : 0);
      } else {
        cash = rawCash + totalRaised;
      }
    } else {
      cash = rawCash;
    }
    day = nd;

    if (isPayday) {
      const reserveOk = cash >= paydayExpenses * WIN_RESERVE_MONTHS;
      const incomeOk = paydayExpenses > 0 && paydayPassiveIncome >= paydayExpenses;
      consecutiveWinningPaydays = incomeOk && reserveOk ? consecutiveWinningPaydays + 1 : 0;
      if (consecutiveWinningPaydays >= WIN_STREAK_TARGET) {
        won = true;
        break;
      }
    }
    if (pendingAssetDecision) break;
  }

  if (expiredListings + snipedListings > 0) {
    events.push({
      title: "OppMarket a continué de vivre",
      detail: `${expiredListings} annonce${expiredListings > 1 ? "s ont" : " a"} expiré${expiredListings > 1 ? "es" : ""}${snipedListings ? ` et ${snipedListings} opportunité${snipedListings > 1 ? "s ont" : " a"} été saisie${snipedListings > 1 ? "s" : ""} par d'autres acheteurs` : ""}. De nouvelles offres sont disponibles.`,
      tone: "info",
    });
  }

  return {
    day, cash, profession, debts, liabilities, kids, assets, listings, opportunityTurn,
    tokens, pendingArcs, sectorConditions, economicModifier, marketTurn, traderJournalActive,
    babyEnabled, layoffEnabled, layoffMonthsLeft,
    lastSmallDoodadDay, lastBigDoodadDay, lastBabyDay, lastLayoffDay, luckyUntilDay,
    lastSeasonalDays, consecutiveWinningPaydays,
    economicCycle, economicCycleUntilDay,
    events, journalEntries, bankrupt, won, pendingAssetDecision,
  };
}
