import Die from "./Die.jsx";
import { COLORS, styles } from "../../styles/theme.js";

export default function DiceZone({ dice, diceRolling, onRoll, skipTurns, extra, pending, moving, locked, lockedLabel, onEndTurn, endTurnReady }) {
  const busy = diceRolling || pending || moving || locked;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 18, gap: 10 }}>
      <div style={{ display: "flex", gap: 10 }}>
        {dice.map((d, i) => (
          <Die key={i} value={d} rolling={diceRolling} tiltDir={i % 2 === 0 ? -4 : 4} />
        ))}
      </div>
      {extra && <div style={{ fontSize: 11, color: COLORS.inkSoft, fontStyle: "italic" }}>{extra}</div>}
      <button className="btn-primary" style={{ ...styles.primaryBtn, opacity: busy ? 0.5 : 1 }} disabled={busy} onClick={onRoll}>
        {pending ? "Décision en attente…" : moving ? "En chemin…" : locked ? (lockedLabel || "Tour terminé") : skipTurns > 0 ? `Passer le tour (${skipTurns} restant${skipTurns > 1 ? "s" : ""})` : diceRolling ? "…" : "Lancer le dé"}
      </button>
      {endTurnReady && (
        <button className="btn-small" style={styles.smallBtn} onClick={onEndTurn}>Fin du tour →</button>
      )}
    </div>
  );
}
