import { FAST_TRACK_SEQUENCE } from "../../engine/fastTrack.js";
import DiceZone from "./DiceZone.jsx";
import { COLORS, styles } from "../../styles/theme.js";

export default function FastBoard({ fastTrack, displayPosition, dice, diceRolling, onRoll, skipTurns, isDesktop, pending, moving, charityTurnsLeft }) {
  const cellSize = isDesktop ? 60 : 40;
  const labels = { cashflowday: "Cashflow", business: "Business", dream: "Rêve", taxaudit: "Fisc", lawsuit: "Procès", divorce: "Divorce", charity: "Don" };
  const accents = { cashflowday: COLORS.teal, business: COLORS.navy, dream: COLORS.mustard, taxaudit: COLORS.rust, lawsuit: COLORS.rust, divorce: COLORS.charcoal, charity: COLORS.plum };
  return (
    <div style={styles.boardWrap}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", maxWidth: isDesktop ? 480 : 300 }}>
        {FAST_TRACK_SEQUENCE.map((type, i) => {
          const active = fastTrack && i === displayPosition;
          const accent = accents[type] || COLORS.inkSoft;
          return (
            <div key={i} style={{ ...styles.cell, position: "relative", width: cellSize, height: cellSize, border: `2px dashed ${accent}`, background: COLORS.card, color: COLORS.ink, boxShadow: active ? `0 0 0 2px ${COLORS.ink} inset` : "none", transition: "box-shadow 0.15s" }}>
              <div className={active && moving ? "cell-hop" : ""} style={{ fontSize: isDesktop ? 9 : 7.5, textAlign: "center", textTransform: "uppercase", letterSpacing: 0.3, fontWeight: 700, lineHeight: 1.1 }}>{labels[type]}</div>
              {active && <div key={moving ? "h1" : "h0"} className="stamp-pop" style={styles.stampBadge}>ICI</div>}
            </div>
          );
        })}
      </div>
      <DiceZone dice={dice} diceRolling={diceRolling} onRoll={onRoll} skipTurns={skipTurns} extra={charityTurnsLeft > 0 ? `3 dés actifs — ${charityTurnsLeft} tour(s)` : null} pending={pending} moving={moving} />
    </div>
  );
}
