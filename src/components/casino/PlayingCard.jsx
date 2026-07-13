import { COLORS } from "../../styles/theme.js";

export default function PlayingCard({ card, hidden }) {
  const red = card && (card.suit === "♥" || card.suit === "♦");
  return (
    <div style={{ width: 46, height: 66, borderRadius: 6, background: hidden ? COLORS.navy : COLORS.card, border: `2px solid ${COLORS.ink}`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", boxShadow: "2px 2px 0 rgba(35,42,49,0.2)" }}>
      {hidden ? (
        <div style={{ fontSize: 16 }}>🂠</div>
      ) : (
        <>
          <div style={{ fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: 15, color: red ? COLORS.rust : COLORS.ink }}>{card.rank}</div>
          <div style={{ fontSize: 15, color: red ? COLORS.rust : COLORS.ink }}>{card.suit}</div>
        </>
      )}
    </div>
  );
}
