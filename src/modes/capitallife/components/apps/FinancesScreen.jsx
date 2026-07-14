import { LIABILITY_KEYS, LIABILITY_LABELS } from "../../../../engine/financing.js";
import { fmt } from "../../../../utils/format.js";
import { useCapitalLifeColors, getStyles } from "../../styles/theme.js";

function Row({ label, value, bold, tone, C }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderBottom: `1px solid ${C.line}` }}>
      <span style={{ color: bold ? C.ink : C.inkSoft, fontWeight: bold ? 700 : 400 }}>{label}</span>
      <span style={{ fontFamily: "ui-monospace, monospace", fontVariantNumeric: "tabular-nums", fontWeight: bold ? 700 : 400, color: tone === "good" ? C.good : tone === "bad" ? C.bad : C.ink }}>{value}</span>
    </div>
  );
}

export default function FinancesScreen({ day, profession, kids, debts, liabilities, passiveIncome, layoffMonthsLeft, currency, onBack }) {
  const C = useCapitalLifeColors();
  const styles = getStyles(C);
  const f = (n) => fmt(n, currency);

  const month = Math.floor((day - 1) / 30) + 1;
  const niveau = 1 + Math.floor(month / 6);
  const e = profession.expenses;
  const debtMonthly = debts.reduce((s, d) => s + d.monthlyPayment, 0);
  const liabilityExpenses = LIABILITY_KEYS.reduce((s, key) => s + ((liabilities[key] > 0) ? e[key] : 0), 0);
  const fixedExpenses = e.taxes + e.other + kids * profession.perChild;
  const totalExpenses = fixedExpenses + liabilityExpenses;
  const salary = layoffMonthsLeft > 0 ? 0 : profession.salary;
  const netCashflow = salary + passiveIncome - totalExpenses - debtMonthly;

  return (
    <div style={styles.app}>
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={onBack}>←</button>
        <div style={{ fontSize: 15, fontWeight: 700, flex: 1 }}>📊 Finances</div>
        <div style={{ width: 30 }} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        <div style={styles.card}>
          <div style={{ padding: 16 }}>
            <div style={styles.sectionTitle}>Compte de résultat mensuel</div>
            <Row C={C} label="Salaire" value={f(salary)} tone={layoffMonthsLeft > 0 ? "bad" : undefined} />
            {passiveIncome > 0 && <Row C={C} label="Revenus passifs" value={f(passiveIncome)} tone="good" />}
            {e.taxes > 0 && <Row C={C} label="Impôts" value={`-${f(e.taxes)}`} tone="bad" />}
            {LIABILITY_KEYS.map((key) => (liabilities[key] > 0) && (
              <Row key={key} C={C} label={LIABILITY_LABELS[key]} value={`-${f(e[key])}`} tone="bad" />
            ))}
            {e.other > 0 && <Row C={C} label="Autres dépenses" value={`-${f(e.other)}`} tone="bad" />}
            {kids > 0 && <Row C={C} label={`Enfants (${kids})`} value={`-${f(kids * profession.perChild)}`} tone="bad" />}
            {debts.map((d) => (
              <Row key={d.id} C={C} label={`Dette — ${d.reason}`} value={`-${f(d.monthlyPayment)}`} tone="bad" />
            ))}
            <Row C={C} label="Cash-flow net" value={`${netCashflow >= 0 ? "+" : ""}${f(netCashflow)}/mois`} bold tone={netCashflow >= 0 ? "good" : "bad"} />
          </div>
        </div>

        <div style={{ ...styles.card, marginTop: 14 }}>
          <div style={{ padding: 16 }}>
            <div style={styles.sectionTitle}>Progression</div>
            <Row C={C} label="Mois joués" value={month} />
            <Row C={C} label="Niveau" value={niveau} bold />
            {debts.length > 0 && <Row C={C} label="Dettes en cours" value={debts.length} />}
          </div>
        </div>
      </div>
    </div>
  );
}
