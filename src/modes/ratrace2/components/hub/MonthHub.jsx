import { calcExpenses } from "../../../../engine/financing.js";
import { fmt } from "../../../../utils/format.js";
import Row from "../../../../components/ledger/Row.jsx";
import { styles, COLORS, CSS_EXTRA } from "../../../../styles/theme.js";

export default function MonthHub({ day, cash, profession, debt, currency, onNextDay, onMenu }) {
  const month = Math.floor((day - 1) / 30) + 1;
  const dayOfMonth = ((day - 1) % 30) + 1;
  const f = (n) => fmt(n, currency);
  const expenses = profession ? calcExpenses(profession, 0, 0) + (debt ? debt.monthlyPayment : 0) : 0;
  const netCashflow = profession ? profession.salary - expenses : 0;

  return (
    <div className="screen-in" style={{ ...styles.app, overflowY: "auto", padding: "16px 14px 40px", alignItems: "center", display: "flex", flexDirection: "column" }}>
      <style>{CSS_EXTRA}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", maxWidth: 420, marginBottom: 10 }}>
        <button className="btn-small" style={styles.smallBtn} onClick={onMenu}>Menu</button>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 18, color: COLORS.ink, fontWeight: 700 }}>📅 Rat Race 2</div>
        <div style={{ width: 70 }} />
      </div>

      <div style={{ ...styles.ledger, width: "100%", maxWidth: 420, textAlign: "center" }}>
        <div style={{ fontSize: 11, color: COLORS.inkSoft, textTransform: "uppercase", letterSpacing: 1 }}>Mois {month} — jour {dayOfMonth}/30</div>
        <div style={{ fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: 22, color: COLORS.ink, marginTop: 4 }}>{f(cash)}</div>
        {profession && <div style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 4 }}>{profession.icon} {profession.name}</div>}
      </div>

      {profession && (
        <div style={{ ...styles.ledger, width: "100%", maxWidth: 420, marginTop: 10 }}>
          <div style={styles.ledgerTitle}>Compte de résultat mensuel</div>
          <Row label="Salaire" value={f(profession.salary)} />
          <Row label="Dépenses fixes" value={f(calcExpenses(profession, 0, 0))} negative />
          {debt && <Row label={`Dette (${debt.reason})`} value={f(debt.monthlyPayment)} negative />}
          <Row label="Cashflow net" value={`${netCashflow >= 0 ? "+" : ""}${f(netCashflow)}/mois`} bold negative={netCashflow < 0} />
          {debt && <Row label="Dette restante" value={`${f(debt.balance)} (${debt.monthsRemaining} mois)`} />}
        </div>
      )}

      <div style={{ fontSize: 12, color: COLORS.inkSoft, fontStyle: "italic", marginTop: 16, maxWidth: 340, textAlign: "center" }}>
        Le hub complet (Bourse, Site d'opportunités, Relevé, Casino) arrive dans les prochaines étapes.
      </div>

      <button className="btn-primary" style={{ ...styles.primaryBtn, marginTop: 20 }} onClick={onNextDay}>Jour suivant ▶</button>
    </div>
  );
}
