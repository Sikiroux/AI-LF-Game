import { rand, uid, fmt } from "../../utils/format.js";
import { SECTOR_LABELS } from "../../data/sectors.js";
import { ARC_TEMPLATES, GLOBAL_ECONOMY_NEWS, TRADER_SENTIMENTS_POSITIVE, TRADER_SENTIMENTS_NEGATIVE } from "./arcs.js";
import { makeCandle } from "./tokenGenerator.js";

export const BROKERAGE_FEE_RATE = 0.0075; // commission de courtage 0,75% à l'achat et à la vente

// Fait avancer le marché de N jours d'un coup, indépendamment de ce qui déclenche
// l'appel (lancer de dé en mode classique, jour simulé en Rat Race 2). Fonction pure :
// ne touche à aucun état React, se contente de calculer le nouvel état à partir de l'ancien.
export function tickMarketDays(state, days) {
  const { tokens, pendingArcs, sectorConditions, economicModifier, marketTurn, traderJournalActive, economicEffectDuration, economicEffectPermanent, assets, currency } = state;
  let curTokens = tokens.map((t) => ({ ...t }));
  let curPendingArcs = pendingArcs.map((p) => ({ ...p }));
  let curSectorConditions = { ...sectorConditions };
  let curEconomicModifier = { ...economicModifier };
  let curMarketTurn = marketTurn;
  let newJournalEntries = [];
  let cashDelta = 0;

  for (let d = 0; d < days; d++) {
    curMarketTurn += 1;
    const nextTurn = curMarketTurn;
    const dueEvents = [];
    const remaining = [];
    curPendingArcs.forEach((p) => { if (p.triggerTurn <= nextTurn) dueEvents.push(p); else remaining.push(p); });
    curPendingArcs = remaining;

    const bySymbol = Object.fromEntries(curTokens.map((t) => [t.symbol, t]));

    dueEvents.forEach((p) => {
      const arc = ARC_TEMPLATES.find((a) => a.id === p.arcId);
      const token = bySymbol[p.tokenSymbol];
      if (!arc || !token) return;
      const stage = arc.stages[p.stageIndex];
      newJournalEntries.push({ id: uid(), turn: nextTurn, title: stage.title(token), detail: stage.detail, token: token.symbol, sector: token.sector, effect: stage.effect, arc: arc.id });
      if (stage.sectorEffect) {
        const duration = economicEffectPermanent ? Infinity : economicEffectDuration;
        curSectorConditions[token.sector] = { kind: stage.sectorEffect.kind, expiresTurn: nextTurn + duration };
        if (stage.sectorEffect.kind === "bankrupt") {
          let hit = 0;
          (assets || []).forEach((a) => { if (a.sector === token.sector) hit += Math.round((a.downPayment != null ? a.downPayment : a.cost * 0.1) * 0.2); });
          if (hit > 0) {
            cashDelta -= hit;
            newJournalEntries.push({ id: uid(), turn: nextTurn, title: "Contagion sectorielle", detail: `Une faillite dans ${SECTOR_LABELS[token.sector]} coûte ${fmt(hit, currency)} à vos actifs.`, token: null, sector: token.sector, effect: 0, arc: null });
          }
        }
      }
      if (p.stageIndex + 1 < arc.stages.length) {
        const [lo, hi] = arc.delayRange;
        const delay = lo + Math.floor(Math.random() * (hi - lo + 1));
        curPendingArcs.push({ arcId: arc.id, tokenSymbol: token.symbol, stageIndex: p.stageIndex + 1, triggerTurn: nextTurn + delay });
      }
    });

    const trigger = Math.random() < 0.4;
    if (trigger) {
      const activeArcTokens = curPendingArcs.map((p) => p.arcId + ":" + p.tokenSymbol);
      if (Math.random() < 0.35) {
        const arc = rand(ARC_TEMPLATES);
        const candidates = curTokens.filter((t) => arc.sectors.includes(t.sector) && !activeArcTokens.includes(arc.id + ":" + t.symbol));
        if (candidates.length) {
          const token = rand(candidates);
          const stage = arc.stages[0];
          newJournalEntries.push({ id: uid(), turn: nextTurn, title: stage.title(token), detail: stage.detail, token: token.symbol, sector: token.sector, effect: stage.effect, arc: arc.id });
          if (stage.sectorEffect) {
            const duration = economicEffectPermanent ? Infinity : economicEffectDuration;
            curSectorConditions[token.sector] = { kind: stage.sectorEffect.kind, expiresTurn: nextTurn + duration };
          }
          const [lo, hi] = arc.delayRange;
          const delay = lo + Math.floor(Math.random() * (hi - lo + 1));
          curPendingArcs.push({ arcId: arc.id, tokenSymbol: token.symbol, stageIndex: 1, triggerTurn: nextTurn + delay });
        }
      } else if (Math.random() < 0.3) {
        const news = rand(GLOBAL_ECONOMY_NEWS);
        newJournalEntries.push({ id: uid(), turn: nextTurn, title: news.title, detail: news.detail, token: null, sector: null, effect: news.effect, arc: null });
        const duration = economicEffectPermanent ? Infinity : economicEffectDuration;
        curEconomicModifier = { loanRateMult: news.loanRateMult, expiresTurn: nextTurn + duration };
      } else {
        const token = rand(curTokens);
        const isGood = Math.random() < 0.5;
        const effect = (isGood ? 1 : -1) * (0.03 + Math.random() * 0.06);
        newJournalEntries.push({ id: uid(), turn: nextTurn, title: isGood ? `${token.name} publie de bons résultats` : `${token.name} déçoit le marché`, detail: isGood ? "Le titre progresse." : "Le titre recule.", token: token.symbol, sector: token.sector, effect, arc: null });
      }
    }

    if (traderJournalActive) {
      const cost = Math.max(10, Math.round(curTokens.length * 2));
      cashDelta -= cost;
      const token = rand(curTokens);
      const reliable = Math.random() < 0.75;
      const trulyPositive = token.solidity >= 50;
      const showPositive = reliable ? trulyPositive : !trulyPositive;
      const phrase = rand(showPositive ? TRADER_SENTIMENTS_POSITIVE : TRADER_SENTIMENTS_NEGATIVE).replace("{t}", token.name);
      newJournalEntries.push({ id: uid(), turn: nextTurn, title: phrase, detail: "Source : Journal des Traders (abonnement).", token: token.symbol, sector: token.sector, effect: 0, arc: null, sentiment: true });
    }

    const dayEvents = newJournalEntries.filter((e) => e.turn === nextTurn);
    curTokens = curTokens.map((t) => {
      let trend = t.trend, trendTurnsLeft = t.trendTurnsLeft - 1;
      if (trendTurnsLeft <= 0) {
        const bullChance = t.solidity > 60 ? 0.55 : t.solidity > 35 ? 0.4 : 0.25;
        const roll = Math.random();
        trend = roll < bullChance ? "bull" : roll < bullChance + 0.3 ? "flat" : "bear";
        trendTurnsLeft = 4 + Math.floor(Math.random() * 7);
      }
      const trendBias = trend === "bull" ? t.volatility * 0.5 : trend === "bear" ? -t.volatility * 0.5 : 0;
      let extraEffect = 0;
      dayEvents.forEach((ev) => { if (ev.token === t.symbol) extraEffect += ev.effect; });
      const cond = curSectorConditions[t.sector];
      if (cond && nextTurn < cond.expiresTurn) {
        if (cond.kind === "boom") extraEffect += 0.01;
        if (cond.kind === "bankrupt") extraEffect -= 0.01;
      }
      const candle = makeCandle(t.price, t.volatility, trendBias, extraEffect);
      const history = [...t.history, candle].slice(-40);
      const lastChangePct = (candle.close - candle.open) / candle.open;
      return { ...t, price: candle.close, history, lastChangePct, trend, trendTurnsLeft };
    });
  }

  return {
    tokens: curTokens,
    pendingArcs: curPendingArcs,
    sectorConditions: curSectorConditions,
    economicModifier: curEconomicModifier,
    marketTurn: curMarketTurn,
    cashDelta,
    journalEntries: newJournalEntries,
  };
}
