import { SECTOR_COLORS, SECTOR_LABELS } from "../../../../data/sectors.js";

export default function TokenListItem({ token, position, active, onSelect, C, styles }) {
  const up = token.lastChangePct >= 0;
  const accent = SECTOR_COLORS[token.sector] || C.inkSoft;
  const shares = position ? position.shares : 0;
  const gainPct = shares > 0 && position.avgCost ? ((token.price - position.avgCost) / position.avgCost) * 100 : null;
  return (
    <button
      onClick={onSelect}
      style={{
        ...styles.card, textAlign: "left", cursor: "pointer", font: "inherit", color: "inherit",
        padding: "8px 10px", display: "flex", justifyContent: "space-between", alignItems: "center",
        borderColor: active ? C.ink : accent, borderWidth: active ? 1.5 : 1,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <span style={{ ...styles.mono, fontWeight: 700, fontSize: 12, color: C.ink }}>{token.symbol}</span>
        <span style={{ fontSize: 9, color: C.inkSoft }}>{SECTOR_LABELS[token.sector]}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
        {shares > 0 && (
          <span style={{ fontSize: 10, fontWeight: 700, color: C.ink }}>
            ×{shares}{gainPct != null && <span style={{ color: gainPct >= 0 ? C.good : C.bad }}> ({gainPct >= 0 ? "+" : ""}{gainPct.toFixed(0)}%)</span>}
          </span>
        )}
        <span style={{ fontSize: 11, fontWeight: 700, color: up ? C.good : C.bad }}>{up ? "▲" : "▼"} {(Math.abs(token.lastChangePct) * 100).toFixed(1)}%</span>
      </div>
    </button>
  );
}
