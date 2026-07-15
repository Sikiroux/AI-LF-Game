import { fmt } from "../../utils/format.js";
import { calcPassiveIncome } from "../../engine/financing.js";
import { styles, COLORS, CSS_EXTRA } from "../../styles/theme.js";

const REASON_LABELS = {
  dream: "a acheté son Rêve en voie rapide",
  income: "a atteint son revenu cible en voie rapide",
  lastStanding: "est le dernier joueur encore en lice",
  allBankrupt: "Tous les joueurs ont fait faillite",
};

export default function MultiplayerEndScreen({ players, winnerId, endReason, turnCount, currency, onReset }) {
  const winner = players.find((p) => p.id === winnerId) || null;
  const ranked = [...players].sort((a, b) => {
    if (a.id === winnerId) return -1;
    if (b.id === winnerId) return 1;
    if (a.eliminated !== b.eliminated) return a.eliminated ? 1 : -1;
    return (b.cash || 0) - (a.cash || 0);
  });

  return (
    <div className="screen-in" style={{ ...styles.app, overflowY: "auto", alignItems: "center", justifyContent: "flex-start", display: "flex", flexDirection: "column", textAlign: "center", padding: 24 }}>
      <style>{CSS_EXTRA}</style>
      <div style={styles.bigStamp}>PARTIE TERMINÉE</div>
      <div style={{ fontSize: 46, marginTop: 14 }}>{winner ? "🏆" : "💥"}</div>
      <div style={{ fontFamily: "Georgia, serif", fontSize: 22, color: COLORS.ink, marginTop: 8, fontWeight: 700 }}>
        {winner ? `${winner.name} remporte la partie !` : "Aucun survivant"}
      </div>
      <div style={{ color: COLORS.inkSoft, marginTop: 6, maxWidth: 340 }}>
        {winner ? `${winner.name} ${REASON_LABELS[endReason] || "a gagné"}.` : REASON_LABELS[endReason] || ""}
      </div>
      <div style={{ color: COLORS.inkSoft, fontSize: 13, marginTop: 6 }}>Terminé en {turnCount} tours.</div>

      <div style={{ width: "100%", maxWidth: 380, marginTop: 20, textAlign: "left" }}>
        <div style={styles.sectionLabel}>Classement final</div>
        {ranked.map((p, i) => {
          const passive = calcPassiveIncome(p.assets || []);
          return (
            <div key={p.id} style={{ ...styles.ledger, padding: "10px 14px", marginBottom: 8, opacity: p.eliminated ? 0.6 : 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 700, color: COLORS.ink }}>
                  {i + 1}. {p.name} {p.isAI && "🤖"} {p.id === winnerId && "🏆"}
                </div>
                <div style={{ fontFamily: "'Courier New', monospace", color: COLORS.teal, fontWeight: 700 }}>{fmt(p.cash, currency)}</div>
              </div>
              <div style={{ fontSize: 11, color: COLORS.inkSoft, marginTop: 4 }}>
                {p.profession?.name} · {p.phase === "fasttrack" ? "Voie rapide" : "Course infernale"} · Revenu passif {fmt(passive, currency)}/mois {p.eliminated ? "· Éliminé (faillite)" : ""}
              </div>
            </div>
          );
        })}
      </div>

      <button className="btn-primary" style={{ ...styles.primaryBtn, marginTop: 24, marginBottom: 24 }} onClick={onReset}>Nouvelle partie</button>
    </div>
  );
}
