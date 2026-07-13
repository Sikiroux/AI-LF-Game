import { fmt } from "../../../../utils/format.js";
import { SECTOR_LABELS } from "../../../../data/sectors.js";
import { styles, COLORS, CSS_EXTRA } from "../../../../styles/theme.js";

export default function OpportunitySiteScreen({ listings, day, cash, currency, onOpen, onBack }) {
  const f = (n) => fmt(n, currency);
  return (
    <div className="screen-in" style={{ ...styles.app, overflowY: "auto", padding: "16px 14px 40px", alignItems: "center", display: "flex", flexDirection: "column" }}>
      <style>{CSS_EXTRA}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", maxWidth: 460, marginBottom: 10 }}>
        <button className="btn-small" style={styles.smallBtn} onClick={onBack}>← Retour</button>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 18, color: COLORS.ink, fontWeight: 700 }}>🏷️ Site d'opportunités</div>
        <div style={{ width: 70 }} />
      </div>
      <div style={{ fontSize: 12, color: COLORS.inkSoft, textAlign: "center", marginBottom: 14 }}>
        Liquidités : <b style={{ color: COLORS.ink }}>{f(cash)}</b> · {listings.length} annonce{listings.length > 1 ? "s" : ""} active{listings.length > 1 ? "s" : ""}
      </div>
      {listings.length === 0 && <div style={{ fontSize: 13, color: COLORS.inkSoft, fontStyle: "italic" }}>Aucune annonce pour l'instant, revenez demain.</div>}
      <div style={{ width: "100%", maxWidth: 460, display: "flex", flexDirection: "column", gap: 8 }}>
        {listings.map((l) => {
          const daysLeft = l.expiresDay - day;
          const affordable = cash >= (l.card.downPayment != null ? l.card.downPayment : l.card.cost);
          return (
            <button key={l.id} className="btn-small" style={{ ...styles.ledger, textAlign: "left", cursor: "pointer", textTransform: "none", letterSpacing: 0, width: "100%", boxSizing: "border-box" }} onClick={() => onOpen(l)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  {l.kind === "jackpot" && <div style={{ fontSize: 10, color: COLORS.mustard, fontWeight: 700, textTransform: "uppercase" }}>🌟 Exceptionnelle</div>}
                  <div style={{ fontFamily: "Georgia, serif", fontWeight: 700, color: COLORS.ink, fontSize: 14 }}>{l.card.title}</div>
                  <div style={{ fontSize: 10, color: COLORS.inkSoft, textTransform: "uppercase" }}>{SECTOR_LABELS[l.card.sector] || ""}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Courier New', monospace", fontWeight: 700, color: affordable ? COLORS.teal : COLORS.rust, fontSize: 13 }}>{f(l.card.cost)}</div>
                  <div style={{ fontSize: 11, color: COLORS.inkSoft }}>+{f(l.card.cashflow)}/mois</div>
                </div>
              </div>
              <div style={{ fontSize: 10, color: daysLeft <= 1 ? COLORS.rust : COLORS.inkSoft, marginTop: 4, fontStyle: "italic" }}>
                Expire dans {daysLeft} jour{daysLeft > 1 ? "s" : ""}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
