import { useCapitalLifeColors, getStyles, FONT_DISPLAY } from "../../styles/theme.js";

export default function CapitalLifeMenuScreen({ hasSave, onResume, onNew, onOptions, onOpenManual, onExitHome }) {
  const C = useCapitalLifeColors();
  const styles = getStyles(C);
  return (
    <div style={{ ...styles.app, alignItems: "center", justifyContent: "center", display: "flex", flexDirection: "column", padding: 24, textAlign: "center" }}>
      <div style={{ ...styles.card, width: "100%", maxWidth: 340, boxSizing: "border-box", padding: "34px 26px 26px" }}>
        <div style={{
          width: 56, height: 56, borderRadius: 18, background: C.accent, color: C.accentInk,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
          margin: "0 auto 18px", boxShadow: `0 4px 14px ${C.accent}59`,
        }}>📅</div>
        <div style={{ fontSize: 11, letterSpacing: 3, color: C.inkSoft, textTransform: "uppercase" }}>Mode</div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 28, color: C.ink, fontWeight: 700, marginBottom: 24 }}>Capital Life</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
          {hasSave && (
            <button className="cl-tap" style={styles.primaryBtn} onClick={onResume}>▶️ Reprendre</button>
          )}
          <button className="cl-tap" style={hasSave ? styles.smallBtn : styles.primaryBtn} onClick={onNew}>
            🗂️ Nouvelle situation
          </button>
          <button className="cl-tap" style={styles.smallBtn} onClick={onOpenManual}>
            📖 Manuel
          </button>
          <button className="cl-tap" style={styles.smallBtn} onClick={onOptions}>⚙️ Options</button>
          <button className="cl-tap" style={{ ...styles.smallBtn, background: "transparent", border: "none", opacity: 0.7 }} onClick={onExitHome}>← Autres modes de jeu</button>
        </div>
      </div>
    </div>
  );
}
