import { COLORS, styles } from "../../styles/theme.js";

export default function Row({ label, value, bold, negative }) {
  return (
    <div style={styles.ledgerRow}>
      <span style={{ color: bold ? COLORS.ink : COLORS.inkSoft, fontWeight: bold ? 700 : 400 }}>{label}</span>
      <span style={{ color: negative ? COLORS.rust : bold ? COLORS.ink : COLORS.ink, fontWeight: bold ? 700 : 400, fontFamily: "'Courier New', monospace" }}>{value}</span>
    </div>
  );
}
