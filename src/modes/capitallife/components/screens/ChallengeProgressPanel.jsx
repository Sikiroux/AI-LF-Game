import { fmt } from "../../../../utils/format.js";
import { useCapitalLifeColors, getStyles, DISPLAY_FONT } from "../../styles/theme.js";

/* Hallmark · component: challenge progress · genre: playful · theme: studied-DNA · pre-emit critique: P5 H5 E4 S5 R5 V4 */

export default function ChallengeProgressPanel({ progress, challenge, currency }) {
  const C = useCapitalLifeColors();
  const styles = getStyles(C);
  if (!progress || !challenge) return null;
  const months = Math.ceil(progress.daysRemaining / 30);
  return (
    <div style={{ ...styles.card, padding: 16, marginBottom: 16, borderColor: progress.daysRemaining <= 90 ? C.bad : C.accent }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div style={{ minWidth: 0 }}><div style={{ fontFamily: DISPLAY_FONT, fontSize: 15, color: C.ink }}>{challenge.title}</div><div style={{ fontSize: 10.5, color: C.inkSoft, marginTop: 2 }}>{fmt(progress.debtRemaining, currency)} de dette restante</div></div>
        <div style={{ textAlign: "right", flexShrink: 0 }}><div style={{ ...styles.mono, fontSize: 16, fontWeight: 800, color: progress.daysRemaining <= 90 ? C.bad : C.accent }}>{months}</div><div style={{ fontSize: 9, color: C.inkSoft, textTransform: "uppercase" }}>mois restants</div></div>
      </div>
      <div style={{ height: 7, borderRadius: 4, background: C.line, marginTop: 12, overflow: "hidden" }}><div style={{ width: `${progress.debtProgressPct}%`, height: "100%", background: C.good }} /></div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10.5, color: C.inkSoft }}><span>Dette remboursée</span><b style={{ color: C.ink }}>{progress.debtProgressPct}%</b></div>
    </div>
  );
}
