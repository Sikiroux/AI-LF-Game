import { useState } from "react";
import { DREAMS } from "../../data/dreams.js";
import { fmt, toEUR } from "../../utils/format.js";
import { RATES_FROM_EUR, CURRENCIES } from "../../data/currencies.js";
import { styles, COLORS, CSS_EXTRA } from "../../styles/theme.js";

export default function DreamPickScreen({ onChoose, onBack, currency }) {
  const rate = RATES_FROM_EUR[currency] || 1;
  const cfg = CURRENCIES[currency];
  const [customMode, setCustomMode] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customCost, setCustomCost] = useState(Math.round(500000 * rate));

  function submitCustom() {
    if (!customTitle.trim() || Number(customCost) <= 0) return;
    onChoose({ title: customTitle.trim(), cost: Math.max(1, toEUR(customCost, currency)), icon: "🎯" });
  }

  return (
    <div style={{ ...styles.app, overflowY: "auto", padding: "26px 18px 40px", alignItems: "center", display: "flex", flexDirection: "column" }}>
      <style>{CSS_EXTRA}</style>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <button className="btn-small" style={{ ...styles.smallBtn, marginBottom: 16 }} onClick={onBack}>← Retour</button>
        <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: COLORS.teal, fontWeight: 700, textAlign: "center" }}>Avant de commencer</div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 22, color: COLORS.ink, textAlign: "center", marginTop: 4, fontWeight: 700 }}>
          Choisissez votre Rêve
        </div>
        <div style={{ color: COLORS.inkSoft, fontSize: 13, textAlign: "center", marginTop: 6 }}>
          C'est l'objectif que vous viserez une fois sorti·e de la course infernale, en voie rapide. Comme dans le vrai jeu, il se choisit avant de jouer.
        </div>

        {!customMode ? (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 18 }}>
              {DREAMS.map((d) => (
                <button key={d.title} className="dream-btn" style={styles.dreamBtn} onClick={() => onChoose(d)}>
                  <span style={{ fontSize: 18, marginRight: 10 }}>{d.icon}</span>
                  <span style={{ flex: 1, textAlign: "left" }}>{d.title}</span>
                  <span style={{ color: COLORS.teal, fontFamily: "'Courier New', monospace", fontWeight: 700 }}>{fmt(d.cost, currency)}</span>
                </button>
              ))}
            </div>
            <button className="btn-small" style={{ ...styles.smallBtn, width: "100%", boxSizing: "border-box", marginTop: 10 }} onClick={() => setCustomMode(true)}>➕ Objectif personnalisé</button>
          </>
        ) : (
          <div style={{ marginTop: 16 }}>
            <label style={styles.formLabel}>Nom de l'objectif</label>
            <input type="text" value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} placeholder="Ex : Ouvrir mon restaurant" style={styles.formInput} />
            <label style={styles.formLabel}>Coût ({cfg.symbol})</label>
            <input type="number" value={customCost} onChange={(e) => setCustomCost(e.target.value)} style={styles.formInput} />
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button className="btn-primary" style={{ ...styles.primaryBtn, flex: 1 }} onClick={submitCustom}>Valider et commencer</button>
              <button className="btn-small" style={{ ...styles.smallBtn, flex: 1 }} onClick={() => setCustomMode(false)}>Retour</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
