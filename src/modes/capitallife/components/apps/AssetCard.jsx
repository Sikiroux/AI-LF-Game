import { useState } from "react";
import { fmt } from "../../../../utils/format.js";
import { amortizedPayment, maxAmortMonths } from "../../../../engine/financing.js";
import { SECTOR_LABELS } from "../../../../data/sectors.js";
import { sectorBadge, DISPLAY_FONT } from "../../styles/theme.js";

function Row({ label, value, tone, C }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "4px 0" }}>
      <span style={{ color: C.inkSoft }}>{label}</span>
      <span style={{ fontFamily: "ui-monospace, monospace", fontVariantNumeric: "tabular-nums", color: tone === "bad" ? C.bad : C.ink }}>{value}</span>
    </div>
  );
}

const TYPE_LABELS = { stock: "Actions", realestate: "Immobilier", business: "Business" };

export default function AssetCard({ asset, currency, cash, onPayOff, onStartAmortization, onCancelAmortization, onSelect, C, styles }) {
  const f = (n) => fmt(n, currency);
  const [showAmort, setShowAmort] = useState(false);
  const maxMonths = maxAmortMonths(asset.type);
  const [months, setMonths] = useState(Math.min(120, maxMonths));
  const hasLoan = asset.loanBalance > 0;
  const previewPayment = hasLoan ? Math.round(amortizedPayment(asset.loanBalance, asset.annualRate, months / 12)) : 0;
  const canPayOff = hasLoan && cash >= asset.loanBalance;
  const manageable = asset.condition != null && onSelect;
  const needsAttention = asset.condition != null && asset.condition < 50;

  return (
    <div style={{ ...styles.card, padding: 14, marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: DISPLAY_FONT, fontWeight: 700, color: C.ink, fontSize: 14 }}>{asset.name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
            <span style={sectorBadge(asset.sector, C)}>{SECTOR_LABELS[asset.sector] || ""}</span>
            <span style={{ fontSize: 10, color: C.inkSoft }}>
              {TYPE_LABELS[asset.type] || asset.type}
              {(asset.stakePct ?? 100) < 100 && <> · {asset.stakePct}% détenu</>}
            </span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "ui-monospace, monospace", fontWeight: 700, color: C.good, fontSize: 14 }}>+{f(asset.cashflow)}/mois</div>
        </div>
      </div>

      {manageable && (
        <button className="cl-tap" style={{ ...styles.smallBtn, width: "100%", boxSizing: "border-box", marginTop: 10, ...(needsAttention ? { borderColor: C.bad, color: C.bad } : {}) }} onClick={() => onSelect(asset.id)}>
          {needsAttention ? "⚠ Gérer — nécessite votre attention" : "Gérer"}
        </button>
      )}

      {hasLoan && (
        <>
          <div style={{ borderTop: `1px solid ${C.line}`, marginTop: 10, paddingTop: 8 }}>
            <Row C={C} label="Solde dû" value={f(asset.loanBalance)} tone="bad" />
            <Row C={C} label="Mensualité actuelle" value={f(asset.loanMonthly)} tone="bad" />
            <Row C={C} label="Type" value={asset.amortizing ? `Mensualités classiques (${asset.amortMonths} mois)` : "Intérêts seuls (solde ne baisse pas)"} />
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button className="cl-tap" style={{ ...styles.primaryBtn, flex: 1, padding: "9px 10px", opacity: canPayOff ? 1 : 0.4 }} disabled={!canPayOff} onClick={() => onPayOff(asset.id)}>Rembourser le solde entier</button>
          </div>
          {!canPayOff && <div style={{ fontSize: 10, color: C.bad, marginTop: 4 }}>Liquidités insuffisantes pour solder d'un coup.</div>}

          {!asset.amortizing ? (
            <>
              <button className="cl-tap" style={{ ...styles.smallBtn, width: "100%", boxSizing: "border-box", marginTop: 8 }} onClick={() => setShowAmort((v) => !v)}>
                {showAmort ? "Annuler" : "Option avancée : passer en mensualités classiques"}
              </button>
              {showAmort && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input type="range" min={12} max={maxMonths} step={6} value={months} onChange={(e) => setMonths(Number(e.target.value))} style={{ flex: 1 }} />
                    <div style={{ fontFamily: "ui-monospace, monospace", fontWeight: 700, color: C.ink, width: 60, textAlign: "right" }}>{months} mois</div>
                  </div>
                  <div style={{ fontSize: 11, color: C.inkSoft, marginTop: 4 }}>Mensualité estimée : <b style={{ color: C.ink }}>{f(previewPayment)}</b>/mois (capital + intérêts). Le solde baisse à chaque paie jusqu'à être remboursé.</div>
                  <button className="cl-tap" style={{ ...styles.primaryBtn, width: "100%", boxSizing: "border-box", marginTop: 8 }} onClick={() => { onStartAmortization(asset.id, months); setShowAmort(false); }}>Activer sur {months} mois</button>
                </div>
              )}
            </>
          ) : (
            <button className="cl-tap" style={{ ...styles.smallBtn, width: "100%", boxSizing: "border-box", marginTop: 8 }} onClick={() => onCancelAmortization(asset.id)}>Repasser en intérêts seuls</button>
          )}
        </>
      )}
    </div>
  );
}
