import { useState } from "react";
import { styles, COLORS, CSS_EXTRA } from "../../styles/theme.js";

function defaultPlayers(n) {
  return Array.from({ length: n }, (_, i) => ({ name: `Joueur ${i + 1}`, isAI: i > 0 }));
}

export default function MultiplayerSetupScreen({ onBack, onStart }) {
  const [numPlayers, setNumPlayers] = useState(3);
  const [players, setPlayers] = useState(defaultPlayers(3));

  function changeNumPlayers(n) {
    setNumPlayers(n);
    setPlayers((prev) => {
      const next = defaultPlayers(n);
      for (let i = 0; i < Math.min(prev.length, n); i++) next[i] = prev[i];
      return next;
    });
  }

  function updateName(i, name) {
    setPlayers((prev) => prev.map((p, idx) => (idx === i ? { ...p, name } : p)));
  }
  function toggleAI(i) {
    setPlayers((prev) => prev.map((p, idx) => (idx === i ? { ...p, isAI: !p.isAI } : p)));
  }

  function start() {
    const configs = players.map((p, i) => ({ name: p.name.trim() || `Joueur ${i + 1}`, isAI: p.isAI }));
    onStart(configs);
  }

  return (
    <div className="screen-in" style={{ ...styles.app, overflowY: "auto", padding: "26px 18px 40px", alignItems: "center", display: "flex", flexDirection: "column" }}>
      <style>{CSS_EXTRA}</style>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <button className="btn-small" style={{ ...styles.smallBtn, marginBottom: 16 }} onClick={onBack}>← Menu</button>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: COLORS.inkSoft, textTransform: "uppercase" }}>Mode</div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 26, color: COLORS.ink, fontWeight: 700 }}>Multijoueur local</div>
          <div style={{ color: COLORS.inkSoft, fontSize: 13, marginTop: 6 }}>Jouez à tour de rôle sur le même appareil, avec ou sans IA.</div>
        </div>

        <div style={styles.sectionLabel}>Nombre de joueurs</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 20 }}>
          {[2, 3, 4].map((n) => (
            <button key={n} className="chip-btn" style={{ ...styles.currencyChip, ...(numPlayers === n ? styles.currencyChipActive : {}) }} onClick={() => changeNumPlayers(n)}>{n}</button>
          ))}
        </div>

        <div style={styles.sectionLabel}>Joueurs</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {players.map((p, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="text" value={p.name} onChange={(e) => updateName(i, e.target.value)} placeholder={`Joueur ${i + 1}`} style={{ ...styles.formInput, flex: 1 }} />
              <button
                className="chip-btn"
                style={{ ...styles.currencyChip, ...(p.isAI ? styles.currencyChipActive : {}), whiteSpace: "nowrap" }}
                onClick={() => toggleAI(i)}
              >
                {p.isAI ? "🤖 IA" : "🙂 Humain"}
              </button>
            </div>
          ))}
        </div>

        <button className="btn-primary" style={{ ...styles.primaryBtn, width: "100%", boxSizing: "border-box" }} onClick={start}>Continuer</button>
        <div style={{ fontSize: 11, color: COLORS.inkSoft, marginTop: 10, textAlign: "center" }}>Chaque joueur humain choisit ensuite son métier et son rêve.</div>
      </div>
    </div>
  );
}
