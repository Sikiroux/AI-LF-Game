import { useState } from "react";
import { fmt } from "../../utils/format.js";
import { LIABILITY_KEYS, LIABILITY_LABELS } from "../../engine/financing.js";
import { CAPITAL_LIFE_LIABILITY_ANNUAL_RATES } from "../../modes/capitallife/engine/liabilities.js";
import { styles as classicStyles, COLORS as classicColors, CSS_EXTRA } from "../../styles/theme.js";
import { useCapitalLifeColors, getStyles as getCLStyles } from "../../modes/capitallife/styles/theme.js";
import DebtCard from "./DebtCard.jsx";

// Écran "Mes dettes" partagé entre le mode classique et Capital Life : même
// logique de remboursement et même façon de combiner les dettes de départ
// (liabilities, communes aux deux modes) et les emprunts/imprévus propres à
// Capital Life (`extraDebts`) — seul l'habillage visuel change avec `variant`.
export default function DebtsScreen({ variant, profession, liabilities, extraDebts = [], cash, currency, onPayOffLiability, onPayOffDebt, onConsolidateDebts, onTakePersonalLoan, onBack }) {
  const capitalLifeColors = useCapitalLifeColors();
  const f = (n) => fmt(n, currency);

  const liabilityDebts = LIABILITY_KEYS.filter((k) => liabilities[k] > 0).map((k) => ({
    id: k, kind: "liability", label: LIABILITY_LABELS[k], balance: liabilities[k], monthlyPayment: profession.expenses[k], annualRate: variant === "capitallife" ? CAPITAL_LIFE_LIABILITY_ANNUAL_RATES[k] : null,
  }));
  const loanDebts = extraDebts.filter((d) => d.balance > 0).map((d) => ({
    id: d.id, kind: "loan", label: d.reason, balance: d.balance, monthlyPayment: d.monthlyPayment, monthsRemaining: d.monthsRemaining, annualRate: d.annualRate,
  }));
  const all = [...liabilityDebts, ...loanDebts];
  const totalBalance = all.reduce((s, d) => s + d.balance, 0);
  const [loanAmount, setLoanAmount] = useState(5000);
  const [loanTerm, setLoanTerm] = useState(36);

  function handlePayOff(id) {
    if (liabilityDebts.some((d) => d.id === id)) onPayOffLiability(id);
    else onPayOffDebt(id);
  }

  if (variant === "capitallife") {
    const C = capitalLifeColors;
    const s = getCLStyles(C);
    const theme = { cardStyle: s.card, primaryBtnStyle: s.primaryBtn, ink: C.ink, inkSoft: C.inkSoft, good: C.good, bad: C.bad, line: C.line, mono: "ui-monospace, monospace", titleFont: {} };
    return (
      <div style={s.app}>
        <div style={s.topBar}>
          <button style={s.backBtn} onClick={onBack}>←</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>💳 Mes dettes</div>
            <div style={{ fontSize: 10, color: C.inkSoft, marginTop: 1 }}>
              Liquidités {f(cash)}{totalBalance > 0 && <> · {f(totalBalance)} dû</>}
            </div>
          </div>
        </div>
        <div style={{ ...s.content, padding: 16 }}>
          {all.length === 0 && <div style={{ fontSize: 13, color: C.inkSoft, fontStyle: "italic", textAlign: "center", marginTop: 24 }}>Aucune dette en cours.</div>}
          {all.map((d) => <DebtCard key={d.id} debt={d} currency={currency} cash={cash} onPayOff={handlePayOff} theme={theme} />)}
          {onTakePersonalLoan && (
            <div style={{ ...s.card, padding: 14, marginTop: 12 }}>
              <div style={{ fontWeight: 700, color: C.ink }}>Prêt personnel bancaire</div>
              <div style={{ fontSize: 11, color: C.inkSoft, margin: "5px 0 10px" }}>1 000 à 50 000 · taux annuel simplifié 9% · plafond d'endettement 33%.</div>
              <input type="number" min="1000" max="50000" step="1000" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: 9, borderRadius: 8, border: `1px solid ${C.line}`, background: C.surfaceRaised, color: C.ink }} />
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>{[24, 36, 60].map((m) => <button key={m} style={{ ...s.chip, ...(loanTerm === m ? s.chipActive : {}) }} onClick={() => setLoanTerm(m)}>{m} mois</button>)}</div>
              <button style={{ ...s.primaryBtn, width: "100%", marginTop: 10 }} onClick={() => onTakePersonalLoan(loanAmount, loanTerm)}>Demander le prêt</button>
            </div>
          )}
          {onConsolidateDebts && loanDebts.length >= 2 && (
            <button style={{ ...s.smallBtn, width: "100%", boxSizing: "border-box", marginTop: 10 }} onClick={onConsolidateDebts}>
              Consolider mes dettes en une seule mensualité (frais de 10%)
            </button>
          )}
        </div>
      </div>
    );
  }

  const theme = { cardStyle: classicStyles.ledger, primaryBtnStyle: classicStyles.primaryBtn, ink: classicColors.ink, inkSoft: classicColors.inkSoft, good: classicColors.teal, bad: classicColors.rust, line: classicColors.paperDark, mono: "'Courier New', monospace", titleFont: { fontFamily: "Georgia, serif" } };
  return (
    <div className="screen-in" style={{ ...classicStyles.app, overflowY: "auto", padding: "16px 14px 40px", alignItems: "center", display: "flex", flexDirection: "column" }}>
      <style>{CSS_EXTRA}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", maxWidth: 420, marginBottom: 10 }}>
        <button className="btn-small" style={classicStyles.smallBtn} onClick={onBack}>← Retour</button>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 18, color: classicColors.ink, fontWeight: 700 }}>💳 Mes dettes</div>
        <div style={{ width: 70 }} />
      </div>
      <div style={{ fontSize: 12, color: classicColors.inkSoft, textAlign: "center", marginBottom: 14 }}>
        Liquidités : <b style={{ color: classicColors.ink }}>{f(cash)}</b>{totalBalance > 0 && <> · Total dû : <b style={{ color: classicColors.rust }}>{f(totalBalance)}</b></>}
      </div>
      {all.length === 0 && <div style={{ fontSize: 13, color: classicColors.inkSoft, fontStyle: "italic" }}>Aucune dette en cours.</div>}
      <div style={{ width: "100%", maxWidth: 420 }}>
        {all.map((d) => <DebtCard key={d.id} debt={d} currency={currency} cash={cash} onPayOff={handlePayOff} theme={theme} />)}
      </div>
    </div>
  );
}
