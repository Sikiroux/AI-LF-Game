export default function PlayingCard({ card, hidden, C }) {
  const red = card && (card.suit === "♥" || card.suit === "♦");
  return (
    <div style={{ width: 46, height: 66, borderRadius: 6, background: hidden ? C.surfaceRaised : C.surface, border: `2px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", boxShadow: `2px 2px 0 ${C.line}` }}>
      {hidden ? (
        <div style={{ fontSize: 16 }}>🂠</div>
      ) : (
        <>
          <div style={{ fontFamily: "ui-monospace, monospace", fontWeight: 700, fontSize: 15, color: red ? C.bad : C.ink }}>{card.rank}</div>
          <div style={{ fontSize: 15, color: red ? C.bad : C.ink }}>{card.suit}</div>
        </>
      )}
    </div>
  );
}
