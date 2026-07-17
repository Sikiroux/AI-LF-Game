import { useEffect, useState } from "react";
import { calcExpenses } from "../../../../engine/financing.js";
import { fmt } from "../../../../utils/format.js";
import { useCapitalLifeColors, getStyles, DISPLAY_FONT } from "../../styles/theme.js";
import { rentCost } from "../../engine/lifestyle.js";
import { calendarInfo } from "../../engine/seasonalEvents.js";
import { computeTier } from "../../engine/progression.js";
import AppIcon from "./AppIcon.jsx";

const APPS = [
  { key: "finances", emoji: "📊", label: "Finances", file: "icon-finances.png" },
  { key: "opportunities", emoji: "🏷️", label: "OppMarket", file: "icon-oppmarket.png" },
  { key: "trading", emoji: "📈", label: "Bourse", file: "icon-bourse.png" },
  { key: "assets", emoji: "📁", label: "Mes actifs", file: "icon-actifs.png" },
  { key: "debts", emoji: "💳", label: "Mes dettes", file: "icon-dettes.png" },
  { key: "career", emoji: "💼", label: "Carrière", file: "icon-carriere.png" },
  { key: "casino", emoji: "🎰", label: "Casino", file: "icon-casino.png" },
  { key: "forecast", emoji: "🔮", label: "Prévisions", file: "icon-forecast.png" },
];

export default function CapitalLifeHomeScreen({
  day, cash, profession, debts, liabilities, kids, assets, passiveIncome, layoffMonthsLeft, currency,
  lastEvent, hasSkipReport, skipMonthMode, onChangeSkipMonthMode, assetsNeedingAttention, actionPoints,
  rentTier, skills, consecutiveWinningPaydays, winStreakTarget,
  onNextDay, onSkipMonth, onSkipWeek, onSkipToTrainingEnd, onOpenApp, onOpenSkipReport, onMenu,
}) {
  const C = useCapitalLifeColors();
  const styles = getStyles(C);
  const f = (n) => fmt(n, currency);
  const [pendingSkip, setPendingSkip] = useState(null);

  useEffect(() => {
    if (!pendingSkip) return undefined;
    if (pendingSkip.seconds <= 0) {
      const run = pendingSkip.run;
      setPendingSkip(null);
      run();
      return undefined;
    }
    const timer = window.setTimeout(() => {
      setPendingSkip((current) => current ? { ...current, seconds: current.seconds - 1 } : null);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [pendingSkip]);

  const requestSkip = (label, run) => setPendingSkip({ label, run, seconds: 3 });

  const { monthOfYear, year, dayOfMonth, monthName } = calendarInfo(day);
  const debtMonthly = debts.reduce((s, d) => s + d.monthlyPayment, 0);
  const expenses = profession ? calcExpenses(profession, kids, debtMonthly, liabilities) + rentCost(rentTier, profession.salary) : 0;
  const salary = layoffMonthsLeft > 0 ? 0 : (profession ? profession.salary : 0);
  const netCashflow = salary + passiveIncome - expenses;
  const objectifPct = Math.max(0, Math.min(100, Math.round((passiveIncome / Math.max(1, expenses)) * 100)));
  const tier = computeTier({ assets, skills, cash, expenses, netCashflow, finPct: objectifPct, won: false });
  const seasonalHint = monthOfYear === 9 ? "🎒 Rentrée" : monthOfYear === 12 && dayOfMonth >= 10 ? "🎄 Noël approche" : null;

  return (
    <div style={styles.app}>
      <div style={{ ...styles.topBar, justifyContent: "space-between" }}>
        <button className="cl-tap" style={styles.smallBtn} onClick={onMenu}>Menu</button>
        <div style={{ fontFamily: DISPLAY_FONT, fontSize: 14, fontWeight: 700, color: C.ink }}>Capital Life</div>
        <div style={{ width: 54 }} />
      </div>

      <div style={{ background: C.surfaceRaised, padding: "14px 16px 12px", flexShrink: 0 }}>
        <div style={styles.centerCol}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ background: C.accent, color: C.accentInk, borderRadius: 10, padding: "6px 10px", textAlign: "center", lineHeight: 1.1 }}>
                <div style={{ fontFamily: DISPLAY_FONT, fontSize: 18, fontWeight: 800 }}>{day}</div>
                <div style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: "0.06em", opacity: 0.85 }}>Jour</div>
              </div>
              <div style={{ fontSize: 12, color: C.inkSoft }}>
                <b style={{ color: C.ink, fontWeight: 600, display: "block", fontSize: 13 }}>{monthName} — Année {year}</b>
                Jour {dayOfMonth}/30 · {tier ? tier.label : "Débutant"}
                {actionPoints != null && <span> · <span style={{ color: actionPoints > 0 ? C.ink : C.bad, fontWeight: 600 }}>⚡ {actionPoints} PA</span></span>}
                {seasonalHint && <span> · <span style={{ color: C.accent, fontWeight: 700 }}>{seasonalHint}</span></span>}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ ...styles.mono, fontSize: 20, fontWeight: 700 }}>{f(cash)}</div>
              <div style={{ fontSize: 10, color: C.inkSoft, textTransform: "uppercase", letterSpacing: "0.06em" }}>Liquidités</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: "1 1 0", background: C.surface, border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 12px" }}>
              <div style={{ fontSize: 9, color: C.inkSoft, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>Cash-flow / mois</div>
              <div style={{ ...styles.mono, fontSize: 15, fontWeight: 700, color: netCashflow >= 0 ? C.good : C.bad }}>
                {netCashflow >= 0 ? "+" : ""}{f(netCashflow)}
              </div>
            </div>
            <div style={{ flex: "1.2 1 0", background: C.surface, border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 12px" }}>
              <div style={{ fontSize: 9, color: C.inkSoft, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>Indépendance financière</div>
              <div style={{ fontFamily: DISPLAY_FONT, fontSize: 15, fontWeight: 700 }}>{objectifPct}%</div>
              <div style={{ height: 4, borderRadius: 2, background: C.line, marginTop: 6, overflow: "hidden" }}>
                <div style={{ height: "100%", background: C.accent, width: `${objectifPct}%` }} />
              </div>
            </div>
          </div>
          {consecutiveWinningPaydays > 0 && winStreakTarget && (
            <div style={{ fontSize: 11, color: C.good, marginTop: 8, fontWeight: 700 }}>
              🏁 Indépendance financière stable depuis {consecutiveWinningPaydays}/{winStreakTarget} mois de paie
            </div>
          )}
          {layoffMonthsLeft > 0 && (
            <div style={{ fontSize: 11, color: C.bad, marginTop: 8, fontWeight: 700 }}>📉 Sans emploi — {layoffMonthsLeft} mois restant{layoffMonthsLeft > 1 ? "s" : ""}</div>
          )}
        </div>
      </div>

      <div style={{ ...styles.content, padding: "20px 16px" }}>
        {lastEvent && (
          <div style={{ ...styles.card, padding: "12px 14px", marginBottom: 18, borderLeft: `3px solid ${lastEvent.tone === "good" ? C.good : lastEvent.tone === "bad" ? C.bad : lastEvent.tone === "warn" ? C.warn : C.accent}` }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>{lastEvent.title}</div>
            <div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 2, lineHeight: 1.4 }}>{lastEvent.detail}</div>
            {hasSkipReport && (
              <button className="cl-tap"
                style={{ marginTop: 8, background: "transparent", border: "none", color: C.accent, fontSize: 11.5, fontWeight: 700, cursor: "pointer", padding: 0 }}
                onClick={onOpenSkipReport}
              >
                Voir le rapport détaillé →
              </button>
            )}
          </div>
        )}
        <div style={styles.sectionTitle}>Vos applications</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "18px 10px" }}>
          {APPS.map((app) => (
            <AppIcon
              key={app.key}
              emoji={app.emoji}
              label={app.label}
              file={app.file}
              badge={app.key === "assets" ? assetsNeedingAttention : null}
              onClick={() => onOpenApp(app.key)}
            />
          ))}
        </div>
      </div>

      <div style={{ flexShrink: 0, padding: "12px 16px 18px", background: C.surfaceRaised, borderTop: `1px solid ${C.line}` }}>
        <div style={styles.centerCol}>
          <button className="cl-tap" style={{ ...styles.primaryBtn, width: "100%", boxSizing: "border-box" }} onClick={onNextDay}>Jour suivant ▶</button>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            {onSkipWeek && (
              <button className="cl-tap" style={{ ...styles.smallBtn, flex: 1, background: "transparent", border: "none", color: C.inkSoft }} onClick={() => requestSkip("Avancer de 7 jours", onSkipWeek)}>
                ⏭ 7 jours
              </button>
            )}
            <button className="cl-tap" style={{ ...styles.smallBtn, flex: 1, background: "transparent", border: "none", color: C.inkSoft }} onClick={() => requestSkip("Atteindre le mois prochain", onSkipMonth)}>
              ⏭ Mois prochain
            </button>
            {onSkipToTrainingEnd && (
              <button className="cl-tap" style={{ ...styles.smallBtn, flex: 1, background: "transparent", border: "none", color: C.inkSoft }} onClick={() => requestSkip("Atteindre la fin de la formation", onSkipToTrainingEnd)}>
                ⏭ Fin formation
              </button>
            )}
          </div>
          {skipMonthMode && onChangeSkipMonthMode && (
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 8 }}>
              <button className="cl-tap"
                style={{ ...styles.chip, padding: "4px 10px", fontSize: 10.5, ...(skipMonthMode === "auto" ? styles.chipActive : {}) }}
                onClick={() => onChangeSkipMonthMode("auto")}
              >
                Auto-résolution
              </button>
              <button className="cl-tap"
                style={{ ...styles.chip, padding: "4px 10px", fontSize: 10.5, ...(skipMonthMode === "calm" ? styles.chipActive : {}) }}
                onClick={() => onChangeSkipMonthMode("calm")}
              >
                Gestion prudente
              </button>
            </div>
          )}
        </div>
      </div>

      {pendingSkip && (
        <div role="dialog" aria-modal="true" aria-label={pendingSkip.label} style={{ position: "fixed", inset: 0, zIndex: 100, display: "grid", placeItems: "center", padding: 24, background: "rgba(8, 13, 22, 0.58)", backdropFilter: "blur(7px)", WebkitBackdropFilter: "blur(7px)" }}>
          <div style={{ ...styles.card, width: "100%", maxWidth: 330, padding: 22, textAlign: "center" }}>
            <div style={{ fontSize: 10, color: C.accent, textTransform: "uppercase", letterSpacing: 1.6, fontWeight: 800 }}>Accélération du calendrier</div>
            <div style={{ fontFamily: DISPLAY_FONT, fontSize: 20, lineHeight: 1.2, color: C.ink, marginTop: 9 }}>{pendingSkip.label}</div>
            <div style={{ width: 64, height: 64, margin: "18px auto", borderRadius: "50%", display: "grid", placeItems: "center", background: C.accent, color: C.accentInk, fontFamily: DISPLAY_FONT, fontSize: 25, fontWeight: 800 }}>{pendingSkip.seconds}</div>
            <div style={{ fontSize: 12, lineHeight: 1.45, color: C.inkSoft }}>La bourse, les opportunités et les événements continueront d’évoluer. Toute décision obligatoire interrompra l’avance.</div>
            <button className="cl-tap" style={{ ...styles.smallBtn, width: "100%", marginTop: 18 }} onClick={() => setPendingSkip(null)}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}
