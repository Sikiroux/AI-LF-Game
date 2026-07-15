import { fmt } from "../../utils/format.js";
import { styles, COLORS } from "../../styles/theme.js";

export default function PlayersPanel({ players, currentPlayerIndex, currency }) {
  return (
    <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "10px 12px", background: COLORS.paperDark, borderBottom: `1px dashed ${COLORS.inkSoft}`, flexShrink: 0 }}>
      {players.map((p, i) => {
        const active = i === currentPlayerIndex;
        const phaseLabel = p.phase === "fasttrack" ? "Voie rapide" : p.phase === "won" ? "Gagné" : p.phase === "bankrupt" ? "Faillite" : "Course infernale";
        return (
          <div
            key={p.id}
            style={{
              flexShrink: 0, minWidth: 128, background: COLORS.card, borderRadius: 8, padding: "8px 10px",
              border: active ? `2px solid ${COLORS.ink}` : `1.5px dashed ${COLORS.inkSoft}`,
              opacity: p.eliminated ? 0.5 : 1, boxShadow: active ? "2px 2px 0 rgba(35,42,49,0.2)" : "none",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.ink, display: "flex", alignItems: "center", gap: 4 }}>
              {active && "▶ "}{p.name} {p.isAI && <span title="Joueur IA">🤖</span>}
            </div>
            <div style={{ fontSize: 10, color: COLORS.inkSoft, marginTop: 2 }}>{phaseLabel}</div>
            <div style={{ fontSize: 12, fontFamily: "'Courier New', monospace", color: COLORS.teal, fontWeight: 700, marginTop: 2 }}>
              {fmt(p.phase === "fasttrack" && p.fastTrack ? p.fastTrack.fastCash : p.cash, currency)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
