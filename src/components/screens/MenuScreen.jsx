import { useState } from "react";
import { fmt } from "../../utils/format.js";
import { styles, COLORS, CSS_EXTRA } from "../../styles/theme.js";

export default function MenuScreen({ hasSave, profession, phase, cash, currency, onResume, onNew, onOptions, onRules }) {
  const [confirmNew, setConfirmNew] = useState(false);
  const phaseLabel = phase === "fasttrack" ? "Voie rapide" : "Course infernale";
  return (
    <div style={{ ...styles.app, alignItems: "center", justifyContent: "center", display: "flex", flexDirection: "column", padding: 24, textAlign: "center" }}>
      <style>{CSS_EXTRA}</style>
      <div className="screen-in" style={{ ...styles.menuCover, width: "100%", maxWidth: 340, boxSizing: "border-box" }}>
        <div className="menu-watermark" style={styles.menuWatermark}>🧭</div>
        <div style={{ fontSize: 11, letterSpacing: 3, color: COLORS.inkSoft, textTransform: "uppercase" }}>Le jeu de la</div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 32, color: COLORS.ink, fontWeight: 700, letterSpacing: 0.5, marginBottom: 4 }}>Liberté Financière</div>
        <div style={{ fontSize: 11, color: COLORS.inkSoft, marginBottom: 24 }}>Sortez de la course infernale, tamponnez votre route.</div>

        <div className="menu-stagger" style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", position: "relative" }}>
          {hasSave && (
            <div style={styles.menuSaveCard}>
              <div style={{ fontSize: 10, color: COLORS.inkSoft, textTransform: "uppercase", letterSpacing: 1 }}>Partie en cours</div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 15, color: COLORS.ink, fontWeight: 700, marginTop: 2 }}>{profession.icon} {profession.name}</div>
              <div style={{ fontSize: 11, color: COLORS.inkSoft, marginTop: 2 }}>{phaseLabel} · {fmt(cash, currency)}</div>
            </div>
          )}
          {hasSave && (
            <button className="btn-primary" style={styles.primaryBtn} onClick={onResume}><span style={styles.menuBtnIcon}>▶️</span>Reprendre la partie</button>
          )}

          {confirmNew ? (
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-small" style={{ ...styles.smallBtnDanger, flex: 1 }} onClick={onNew}>Confirmer (efface la partie)</button>
              <button className="btn-small" style={{ ...styles.smallBtn, flex: 1 }} onClick={() => setConfirmNew(false)}>Annuler</button>
            </div>
          ) : (
            <button className={hasSave ? "btn-small" : "btn-primary"} style={hasSave ? styles.smallBtn : styles.primaryBtn} onClick={() => (hasSave ? setConfirmNew(true) : onNew())}>
              <span style={styles.menuBtnIcon}>🗂️</span>Nouvelle partie
            </button>
          )}

          <button className="btn-small" style={styles.smallBtn} onClick={onRules}><span style={styles.menuBtnIcon}>📖</span>Règles du jeu</button>
          <button className="btn-small" style={styles.smallBtn} onClick={onOptions}><span style={styles.menuBtnIcon}>⚙️</span>Options</button>
        </div>
      </div>
    </div>
  );
}
