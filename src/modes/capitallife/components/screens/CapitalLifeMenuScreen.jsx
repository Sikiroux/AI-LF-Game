import { styles, COLORS, CSS_EXTRA } from "../../../../styles/theme.js";

export default function CapitalLifeMenuScreen({ hasSave, onResume, onNew, onOptions, onOpenManual, onExitHome }) {
  return (
    <div style={{ ...styles.app, alignItems: "center", justifyContent: "center", display: "flex", flexDirection: "column", padding: 24, textAlign: "center" }}>
      <style>{CSS_EXTRA}</style>
      <div className="screen-in" style={{ ...styles.menuCover, width: "100%", maxWidth: 340, boxSizing: "border-box" }}>
        <div className="menu-watermark" style={styles.menuWatermark}>📅</div>
        <div style={{ fontSize: 11, letterSpacing: 3, color: COLORS.inkSoft, textTransform: "uppercase" }}>Mode</div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 32, color: COLORS.ink, fontWeight: 700, letterSpacing: 0.5, marginBottom: 24 }}>Capital Life</div>

        <div className="menu-stagger" style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
          {hasSave && (
            <button className="btn-primary" style={styles.primaryBtn} onClick={onResume}><span style={styles.menuBtnIcon}>▶️</span>Reprendre</button>
          )}
          <button className={hasSave ? "btn-small" : "btn-primary"} style={hasSave ? styles.smallBtn : styles.primaryBtn} onClick={onNew}>
            <span style={styles.menuBtnIcon}>🗂️</span>Nouvelle situation
          </button>
          <button className="btn-small" style={styles.smallBtn} onClick={onOpenManual}>
            <span style={styles.menuBtnIcon}>📖</span>Manuel
          </button>
          <button className="btn-small" style={styles.smallBtn} onClick={onOptions}><span style={styles.menuBtnIcon}>⚙️</span>Options</button>
          <button className="btn-small" style={{ ...styles.smallBtn, background: "transparent", border: "none", opacity: 0.7 }} onClick={onExitHome}>← Autres modes de jeu</button>
        </div>
      </div>
    </div>
  );
}
