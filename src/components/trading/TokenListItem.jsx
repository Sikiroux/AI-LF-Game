import { SECTOR_COLORS, SECTOR_LABELS } from "../../data/sectors.js";
import { COLORS, styles } from "../../styles/theme.js";

export default function TokenListItem({ token, position, active, onSelect }) {
  const up = token.lastChangePct >= 0;
  const accent = SECTOR_COLORS[token.sector] || COLORS.inkSoft;
  const shares = position ? position.shares : 0;
  const gainPct = shares > 0 && position.avgCost ? ((token.price - position.avgCost) / position.avgCost) * 100 : null;
  return (
    <button className="btn-small" style={{ ...styles.tokenListItem, borderColor: active ? COLORS.ink : accent, borderStyle: active ? "solid" : "dashed" }} onClick={onSelect}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <span style={{ fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: 12, color: COLORS.ink }}>{token.symbol}</span>
        <span style={{ fontSize: 9, color: COLORS.inkSoft }}>{SECTOR_LABELS[token.sector]}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
        {shares > 0 && (
          <span style={{ fontSize: 10, fontWeight: 700, color: COLORS.ink }}>
            ×{shares}{gainPct != null && <span style={{ color: gainPct >= 0 ? COLORS.teal : COLORS.rust }}> ({gainPct >= 0 ? "+" : ""}{gainPct.toFixed(0)}%)</span>}
          </span>
        )}
        <span style={{ fontSize: 11, fontWeight: 700, color: up ? COLORS.teal : COLORS.rust }}>{up ? "▲" : "▼"} {(Math.abs(token.lastChangePct) * 100).toFixed(1)}%</span>
      </div>
    </button>
  );
}
