import { useState } from "react";
import { fmt } from "../../utils/format.js";
import { styles, COLORS, CSS_EXTRA } from "../../styles/theme.js";

export default function MenuScreen({ hasSave, profession, phase, cash, currency, onResume, onNew, onOptions }) {
  const [confirmNew, setConfirmNew] = useState(false);
  const phaseLabel = phase === "fasttrack" ? "Voie rapide" : "Course infernale";
  return (
    <div style={{ ...styles.app, alignItems: "center", justifyContent: "center", display: "flex", flexDirection: "column", padding: 24, textAlign: "center" }}>
      <style>{CSS_EXTRA}</style>
      <div style={{ fontSize: 11, letterSpacing: 3, color: COLORS.inkSoft, textTransform: "uppercase" }}>Le jeu de la</div>
      <div style={{ fontFamily: "Georgia, serif", fontSize: 34, color: COLORS.ink, fontWeight: 700, letterSpacing: 0.5, marginBottom: 26 }}>Liberté Financière</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 320 }}>
        {hasSave && (
          <div style={styles.menuSaveCard}>
            <div style={{ fontSize: 10, color: COLORS.inkSoft, textTransform: "uppercase", letterSpacing: 1 }}>Partie en cours</div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 15, color: COLORS.ink, fontWeight: 700, marginTop: 2 }}>{profession.icon} {profession.name}</div>
            <div style={{ fontSize: 11, color: COLORS.inkSoft, marginTop: 2 }}>{phaseLabel} · {fmt(cash, currency)}</div>
          </div>
        )}
        {hasSave && (
          <button className="btn-primary" style={styles.primaryBtn} onClick={onResume}>Reprendre la partie</button>
        )}

        {confirmNew ? (
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-small" style={{ ...styles.smallBtnDanger, flex: 1 }} onClick={onNew}>Confirmer (efface la partie)</button>
            <button className="btn-small" style={{ ...styles.smallBtn, flex: 1 }} onClick={() => setConfirmNew(false)}>Annuler</button>
          </div>
        ) : (
          <button className={hasSave ? "btn-small" : "btn-primary"} style={hasSave ? styles.smallBtn : styles.primaryBtn} onClick={() => (hasSave ? setConfirmNew(true) : onNew())}>Nouvelle partie</button>
        )}

        <button className="btn-small" style={styles.smallBtn} onClick={onOptions}>Options</button>
      </div>
    </div>
  );
}
