import { useState } from "react";
import { styles, COLORS } from "../../styles/theme.js";
import { fmt } from "../../utils/format.js";
import { amortizedPayment, maxAmortMonths } from "../../engine/financing.js";
import Row from "./Row.jsx";
import { SECTOR_LABELS } from "../../data/sectors.js";

export default function AssetCard({ asset, currency, cash, onPayOff, onStartAmortization, onCancelAmortization }) {
  const f = (n) => fmt(n, currency);
  const [showAmort, setShowAmort] = useState(false);
  const maxMonths = maxAmortMonths(asset.type);
  const [months, setMonths] = useState(Math.min(120, maxMonths));
  const hasLoan = asset.loanBalance > 0;
  const previewPayment = hasLoan ? Math.round(amortizedPayment(asset.loanBalance, asset.annualRate, months / 12)) : 0;
  const canPayOff = hasLoan && cash >= asset.loanBalance;

  return (
    <div style={{ ...styles.ledger, marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: "Georgia, serif", fontWeight: 700, color: COLORS.ink, fontSize: 14 }}>{asset.name}</div>
          <div style={{ fontSize: 10, color: COLORS.inkSoft, textTransform: "uppercase", letterSpacing: 0.5 }}>{SECTOR_LABELS[asset.sector] || ""} · {asset.type === "stock" ? "Actions" : asset.type === "realestate" ? "Immobilier" : "Business"}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "'Courier New', monospace", fontWeight: 700, color: COLORS.teal, fontSize: 14 }}>+{f(asset.cashflow)}/mois</div>
        </div>
      </div>

      {hasLoan && (
        <>
          <div style={styles.ledgerDivider} />
          <Row label="Solde dû" value={f(asset.loanBalance)} negative />
          <Row label="Mensualité actuelle" value={f(asset.loanMonthly)} negative />
          <Row label="Type" value={asset.amortizing ? `Mensualités classiques (${asset.amortMonths} mois)` : "Intérêts seuls (solde ne baisse pas)"} />

          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button className="btn-primary" style={{ ...styles.primaryBtn, flex: 1, padding: "9px 10px", opacity: canPayOff ? 1 : 0.4 }} disabled={!canPayOff} onClick={() => onPayOff(asset.id)}>Rembourser le solde entier</button>
          </div>
          {!canPayOff && <div style={{ fontSize: 10, color: COLORS.rust, marginTop: 4 }}>Liquidités insuffisantes pour solder d'un coup.</div>}

          {!asset.amortizing ? (
            <>
              <button className="btn-small" style={{ ...styles.smallBtn, width: "100%", boxSizing: "border-box", marginTop: 8 }} onClick={() => setShowAmort((v) => !v)}>
                {showAmort ? "Annuler" : "Option avancée : passer en mensualités classiques"}
              </button>
              {showAmort && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input type="range" min={12} max={maxMonths} step={6} value={months} onChange={(e) => setMonths(Number(e.target.value))} style={{ flex: 1 }} />
                    <div style={{ fontFamily: "'Courier New', monospace", fontWeight: 700, color: COLORS.ink, width: 60, textAlign: "right" }}>{months} mois</div>
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.inkSoft, marginTop: 4 }}>Mensualité estimée : <b style={{ color: COLORS.ink }}>{f(previewPayment)}</b>/mois (capital + intérêts). Le solde baisse à chaque paie jusqu'à être remboursé.</div>
                  <button className="btn-primary" style={{ ...styles.primaryBtn, width: "100%", boxSizing: "border-box", marginTop: 8 }} onClick={() => { onStartAmortization(asset.id, months); setShowAmort(false); }}>Activer sur {months} mois</button>
                </div>
              )}
            </>
          ) : (
            <button className="btn-small" style={{ ...styles.smallBtn, width: "100%", boxSizing: "border-box", marginTop: 8 }} onClick={() => onCancelAmortization(asset.id)}>Repasser en intérêts seuls</button>
          )}
        </>
      )}
    </div>
  );
}
