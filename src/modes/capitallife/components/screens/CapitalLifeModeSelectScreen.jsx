import { useCapitalLifeColors, getStyles, DISPLAY_FONT } from "../../styles/theme.js";

/* Hallmark · genre: playful · macrostructure: Workbench choice · design-system: design.md · designed-as-app
 * Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V4 · contrast: pass · responsive: pass */

export default function CapitalLifeModeSelectScreen({ onSandbox, onChallenge, onBack }) {
  const C = useCapitalLifeColors();
  const styles = getStyles(C);
  const choice = (active = false) => ({
    ...styles.card, width: "100%", padding: 16, textAlign: "left",
    background: active ? C.surface : C.surfaceRaised, borderColor: active ? C.accent : C.line,
  });
  return (
    <div style={styles.app}>
      <div style={styles.topBar}><button className="cl-tap" style={styles.backBtn} onClick={onBack}>←</button><div style={{ fontWeight: 700 }}>Choisir une expérience</div></div>
      <div style={{ ...styles.content, padding: 16, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: DISPLAY_FONT, fontSize: 28, lineHeight: 1.08, color: C.ink, overflowWrap: "anywhere" }}>Comment voulez-vous jouer ?</div>
        <p style={{ color: C.inkSoft, fontSize: 13, lineHeight: 1.55, margin: "12px 0 24px" }}>Les deux modes utilisent la même économie. Seuls l'objectif et l'échéance changent.</p>
        <div style={{ display: "grid", gap: 12 }}>
          <div style={choice()}>
            <div style={{ fontFamily: DISPLAY_FONT, fontSize: 18, color: C.ink }}>Vie libre</div>
            <div style={{ fontSize: 12, color: C.inkSoft, lineHeight: 1.45, marginTop: 4 }}>Temps illimité pour apprendre, expérimenter et comparer vos stratégies.</div>
            <button className="cl-tap" style={{ ...styles.smallBtn, width: "100%", marginTop: 12 }} onClick={onSandbox}>Choisir Vie libre</button>
          </div>
          <div style={choice(true)}>
            <div style={{ fontSize: 10, color: C.accent, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 800 }}>Premier défi</div>
            <div style={{ fontFamily: DISPLAY_FONT, fontSize: 18, color: C.ink, marginTop: 4 }}>Sortir du piège</div>
            <div style={{ fontSize: 12, color: C.inkSoft, lineHeight: 1.45, marginTop: 4 }}>24 mois pour rembourser toutes les dettes et reconstruire une réserve.</div>
            <button className="cl-tap" style={{ ...styles.primaryBtn, width: "100%", marginTop: 12 }} onClick={onChallenge}>Lancer le défi</button>
          </div>
        </div>
      </div>
    </div>
  );
}
