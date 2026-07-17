import { fmt } from "../../utils/format.js";

// Carte de dette générique (thème classique ou Capital Life selon `theme`).
// `theme` = { ink, inkSoft, good, bad, line, cardStyle, primaryBtnStyle, mono }
export default function DebtCard({ debt, currency, cash, onPayOff, theme }) {
  const f = (n) => fmt(n, currency);
  const canPayOff = cash >= debt.balance;
  return (
    <div style={{ ...theme.cardStyle, marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontWeight: 700, color: theme.ink, fontSize: 14, ...theme.titleFont }}>{debt.label}</div>
          <div style={{ fontSize: 10, color: theme.inkSoft, textTransform: "uppercase", letterSpacing: "0.04em" }}>{debt.kind === "liability" ? "Dette de départ" : "Emprunt / imprévu"}</div>
        </div>
        <div style={{ fontFamily: theme.mono, fontWeight: 700, color: theme.bad, fontSize: 14 }}>-{f(debt.monthlyPayment)}/mois</div>
      </div>
      <div style={{ borderTop: `1px solid ${theme.line}`, marginTop: 10, paddingTop: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "3px 0" }}>
          <span style={{ color: theme.inkSoft }}>Solde restant dû</span>
          <span style={{ fontFamily: theme.mono, color: theme.ink }}>{f(debt.balance)}</span>
        </div>
        {debt.monthsRemaining != null && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "3px 0" }}>
            <span style={{ color: theme.inkSoft }}>Mois restants</span>
            <span style={{ fontFamily: theme.mono, color: theme.ink }}>{debt.monthsRemaining}</span>
          </div>
        )}
        {debt.annualRate != null && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "3px 0" }}>
            <span style={{ color: theme.inkSoft }}>Taux annuel</span>
            <span style={{ fontFamily: theme.mono, color: theme.ink }}>{(debt.annualRate * 100).toFixed(1)}%</span>
          </div>
        )}
      </div>
      <button
        style={{ ...theme.primaryBtnStyle, width: "100%", boxSizing: "border-box", marginTop: 10, opacity: canPayOff ? 1 : 0.4 }}
        disabled={!canPayOff}
        onClick={() => onPayOff(debt.id)}
      >
        Rembourser le solde entier
      </button>
      {!canPayOff && <div style={{ fontSize: 10, color: theme.bad, marginTop: 4 }}>Liquidités insuffisantes pour solder d'un coup.</div>}
    </div>
  );
}
