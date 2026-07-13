import { SQUARE_STYLES } from "../../engine/ratRace.js";
import { COLORS, styles } from "../../styles/theme.js";

export default function StampCell({ type, active, size, isDesktop, hop }) {
  const st = SQUARE_STYLES[type];
  return (
    <div
      style={{
        ...styles.cell,
        width: size, height: size,
        border: `2px dashed ${st.accent}`,
        background: COLORS.card,
        color: COLORS.ink,
        boxShadow: active ? `0 0 0 2px ${COLORS.ink} inset` : "none",
        transition: "box-shadow 0.15s",
      }}
    >
      <div className={hop ? "cell-hop" : ""} style={{ fontSize: isDesktop ? 17 : 13 }}>{st.icon}</div>
      {active && <div key={hop ? "h1" : "h0"} className="stamp-pop" style={styles.stampBadge}>ICI</div>}
    </div>
  );
}
