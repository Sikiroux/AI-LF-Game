import Row from "./Row.jsx";
import { fmt } from "../../utils/format.js";
import { COLORS, styles } from "../../styles/theme.js";

export default function FastLedger({ fastTrack, currency }) {
  if (!fastTrack) return null;
  const f = (n) => fmt(n, currency);
  const pctDream = Math.min(100, (fastTrack.fastCash / fastTrack.dream.cost) * 100);
  const pctIncome = Math.min(100, (fastTrack.fastIncome / fastTrack.targetIncome) * 100);
  return (
    <div style={styles.ledger}>
      <div style={styles.ledgerTitle}>Voie rapide</div>
      <Row label="Liquidités" value={f(fastTrack.fastCash)} bold />
      <Row label="Revenu voie rapide / tour" value={f(fastTrack.fastIncome)} />
      <div style={styles.ledgerDivider} />

      <div style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 8, marginBottom: 2 }}>Voie 1 — Acheter le rêve</div>
      <Row label={`${fastTrack.dream.icon} ${fastTrack.dream.title}`} value={f(fastTrack.dream.cost)} bold />
      <div style={styles.exitBar}>
        <div style={styles.exitTrack}>
          <div style={{ ...styles.exitFill, width: `${pctDream}%`, background: COLORS.mustard }} />
        </div>
        <div style={{ fontSize: 11, color: COLORS.ink, marginTop: 3, fontFamily: "'Courier New', monospace" }}>{f(fastTrack.fastCash)} / {f(fastTrack.dream.cost)}</div>
      </div>

      <div style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 14, marginBottom: 2 }}>Voie 2 — +50 000 de revenu voie rapide</div>
      <Row label="Objectif de revenu" value={f(fastTrack.targetIncome)} bold />
      <div style={styles.exitBar}>
        <div style={styles.exitTrack}>
          <div style={{ ...styles.exitFill, width: `${pctIncome}%` }} />
        </div>
        <div style={{ fontSize: 11, color: COLORS.ink, marginTop: 3, fontFamily: "'Courier New', monospace" }}>{f(fastTrack.fastIncome)} / {f(fastTrack.targetIncome)}</div>
      </div>
    </div>
  );
}
