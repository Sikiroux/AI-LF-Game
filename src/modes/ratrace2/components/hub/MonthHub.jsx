import { calcExpenses } from "../../../../engine/financing.js";
import { fmt } from "../../../../utils/format.js";
import Row from "../../../../components/ledger/Row.jsx";
import EventBanner from "../../../../components/board/EventBanner.jsx";
import { styles, COLORS, CSS_EXTRA } from "../../../../styles/theme.js";

export default function MonthHub({ day, cash, profession, debts, kids, layoffMonthsLeft, lastEvent, currency, onNextDay, onMenu, onTrading }) {
  const month = Math.floor((day - 1) / 30) + 1;
  const dayOfMonth = ((day - 1) % 30) + 1;
  const f = (n) => fmt(n, currency);
  const debtMonthly = debts.reduce((s, deb) => s + deb.monthlyPayment, 0);
  const expenses = profession ? calcExpenses(profession, kids, debtMonthly) : 0;
  const salary = layoffMonthsLeft > 0 ? 0 : (profession ? profession.salary : 0);
  const netCashflow = salary - expenses;

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
        {profession && (
          <div style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 4 }}>
            {profession.icon} {profession.name}{kids > 0 ? ` · ${kids} enfant${kids > 1 ? "s" : ""}` : ""}
          </div>
        )}
        {layoffMonthsLeft > 0 && <div style={{ fontSize: 11, color: COLORS.rust, marginTop: 4, fontWeight: 700 }}>📉 Sans emploi — {layoffMonthsLeft} mois restant{layoffMonthsLeft > 1 ? "s" : ""}</div>}
      </div>

      {lastEvent && <EventBanner event={lastEvent} />}

      {profession && (
        <div style={{ ...styles.ledger, width: "100%", maxWidth: 420, marginTop: 10 }}>
          <div style={styles.ledgerTitle}>Compte de résultat mensuel</div>
          <Row label="Salaire" value={f(salary)} negative={layoffMonthsLeft > 0} />
          <Row label="Dépenses fixes" value={f(calcExpenses(profession, kids, 0))} negative />
          {debts.map((deb, i) => (
            <Row key={i} label={`Dette (${deb.reason})`} value={f(deb.monthlyPayment)} negative />
          ))}
          <Row label="Cashflow net" value={`${netCashflow >= 0 ? "+" : ""}${f(netCashflow)}/mois`} bold negative={netCashflow < 0} />
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button className="btn-small" style={styles.smallBtn} onClick={onTrading}>📈 Bourse</button>
      </div>

      <div style={{ fontSize: 12, color: COLORS.inkSoft, fontStyle: "italic", marginTop: 16, maxWidth: 340, textAlign: "center" }}>
        Le site d'opportunités arrive dans la prochaine étape.
      </div>

      <button className="btn-primary" style={{ ...styles.primaryBtn, marginTop: 20 }} onClick={onNextDay}>Jour suivant ▶</button>
    </div>
  );
}
