import { calcExpenses } from "../../../../engine/financing.js";
import { fmt } from "../../../../utils/format.js";
import Row from "../../../../components/ledger/Row.jsx";
import { styles, COLORS, CSS_EXTRA } from "../../../../styles/theme.js";

export default function ScenarioScreen({ scenario, currency, onStart, onReroll, onBack }) {
  const { profession, startingCash, debt } = scenario;
  const f = (n) => fmt(n, currency);
  const expenses = calcExpenses(profession, 0, 0);
  const totalExpenses = expenses + debt.monthlyPayment;
  const netCashflow = profession.salary - totalExpenses;

  return (
    <div className="screen-in" style={{ ...styles.app, overflowY: "auto", padding: "26px 18px 40px", alignItems: "center", display: "flex", flexDirection: "column" }}>
      <style>{CSS_EXTRA}</style>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <button className="btn-small" style={{ ...styles.smallBtn, marginBottom: 16 }} onClick={onBack}>← Retour</button>
        <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: COLORS.teal, fontWeight: 700, textAlign: "center" }}>Votre mise en situation</div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 22, color: COLORS.ink, textAlign: "center", marginTop: 4, fontWeight: 700 }}>
          {profession.icon} {profession.name}
        </div>

        <div style={{ ...styles.ledger, marginTop: 18 }}>
          <div style={styles.ledgerTitle}>Situation de départ</div>
          <Row label="Salaire" value={f(profession.salary)} bold />
          <Row label="Dépenses fixes" value={f(expenses)} negative />
          <Row label="Liquidités de départ" value={f(startingCash)} bold />
        </div>

        <div style={{ ...styles.ledger, marginTop: 14 }}>
          <div style={styles.ledgerTitle}>Dette en cours</div>
          <div style={{ fontSize: 13, color: COLORS.ink, fontFamily: "Georgia, serif", marginBottom: 6 }}>{debt.reason}</div>
          <Row label="Solde restant dû" value={f(debt.balance)} negative />
          <Row label="Mensualité" value={f(debt.monthlyPayment)} negative />
          <Row label="Mois restants" value={debt.monthsRemaining} />
        </div>

        <div style={{ ...styles.ledger, marginTop: 14, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: COLORS.inkSoft, marginBottom: 4 }}>Cashflow mensuel net</div>
          <div style={{ fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: 20, color: netCashflow >= 0 ? COLORS.teal : COLORS.rust }}>
            {netCashflow >= 0 ? "+" : ""}{f(netCashflow)}/mois
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
          <button className="btn-primary" style={{ ...styles.primaryBtn, flex: 1 }} onClick={onStart}>Commencer</button>
          <button className="btn-small" style={styles.smallBtn} onClick={onReroll}>🎲 Régénérer</button>
        </div>
      </div>
    </div>
  );
}
