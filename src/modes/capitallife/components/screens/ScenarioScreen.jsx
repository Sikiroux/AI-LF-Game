import { calcExpenses, LIABILITY_KEYS, LIABILITY_LABELS } from "../../../../engine/financing.js";
import { fmt } from "../../../../utils/format.js";
import { useCapitalLifeColors, getStyles } from "../../styles/theme.js";
import { DIFFICULTY_PRESETS } from "../../engine/actionPoints.js";

function Row({ label, value, bold, tone, C }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderBottom: `1px solid ${C.line}` }}>
      <span style={{ color: bold ? C.ink : C.inkSoft, fontWeight: bold ? 700 : 400 }}>{label}</span>
      <span style={{ fontFamily: "ui-monospace, monospace", fontVariantNumeric: "tabular-nums", fontWeight: bold ? 700 : 400, color: tone === "good" ? C.good : tone === "bad" ? C.bad : C.ink }}>{value}</span>
    </div>
  );
}

export default function ScenarioScreen({ scenario, currency, difficulty, onChangeDifficulty, onStart, onReroll, onBack }) {
  const C = useCapitalLifeColors();
  const styles = getStyles(C);
  const { profession, startingCash, liabilities, debt } = scenario;
  const f = (n) => fmt(n, currency);
  const e = profession.expenses;
  const expenses = calcExpenses(profession, 0, 0, liabilities);
  const totalExpenses = expenses + debt.monthlyPayment;
  const netCashflow = profession.salary - totalExpenses;

  return (
    <div style={styles.app}>
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={onBack}>←</button>
        <div style={{ fontSize: 15, fontWeight: 700, flex: 1 }}>Votre mise en situation</div>
      </div>

      <div style={{ ...styles.content, padding: 16 }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: C.accent, fontWeight: 700 }}>Profession</div>
          <div style={{ fontSize: 22, color: C.ink, marginTop: 4, fontWeight: 700 }}>{profession.icon} {profession.name}</div>
        </div>

        <div style={styles.card}>
          <div style={{ padding: 16 }}>
            <div style={styles.sectionTitle}>Compte de résultat mensuel</div>
            <Row C={C} label="Salaire" value={f(profession.salary)} bold />
            {e.taxes > 0 && <Row C={C} label="Impôts" value={`-${f(e.taxes)}`} tone="bad" />}
            {LIABILITY_KEYS.map((key) => (liabilities[key] > 0) && (
              <Row key={key} C={C} label={LIABILITY_LABELS[key]} value={`-${f(e[key])}`} tone="bad" />
            ))}
            {e.other > 0 && <Row C={C} label="Autres dépenses" value={`-${f(e.other)}`} tone="bad" />}
            <Row C={C} label="Dépenses fixes" value={`-${f(expenses)}`} bold tone="bad" />
          </div>
        </div>

        <div style={{ ...styles.card, marginTop: 14 }}>
          <div style={{ padding: 16 }}>
            <div style={styles.sectionTitle}>Dette en cours</div>
            <div style={{ fontSize: 13, color: C.ink, fontWeight: 700, marginBottom: 6 }}>{debt.reason}</div>
            <Row C={C} label="Solde restant dû" value={f(debt.balance)} tone="bad" />
            <Row C={C} label="Mensualité" value={`-${f(debt.monthlyPayment)}`} tone="bad" />
            <Row C={C} label="Mois restants" value={debt.monthsRemaining} />
          </div>
        </div>

        <div style={{ ...styles.card, marginTop: 14 }}>
          <div style={{ padding: 16 }}>
            <div style={styles.sectionTitle}>Bilan de départ</div>
            <Row C={C} label="Liquidités de départ" value={f(startingCash)} bold />
            <Row C={C} label="Cash-flow mensuel net" value={`${netCashflow >= 0 ? "+" : ""}${f(netCashflow)}/mois`} bold tone={netCashflow >= 0 ? "good" : "bad"} />
          </div>
        </div>

        <div style={{ ...styles.card, marginTop: 14 }}>
          <div style={{ padding: 16 }}>
            <div style={styles.sectionTitle}>Difficulté</div>
            <div style={{ fontSize: 11, color: C.inkSoft, marginBottom: 10 }}>
              Fixe le budget quotidien de points d'action pour toute la partie — verrouillé une fois commencé.
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {Object.entries(DIFFICULTY_PRESETS).map(([key, preset]) => (
                <button key={key} style={{ ...styles.chip, ...(difficulty === key ? styles.chipActive : {}) }} onClick={() => onChangeDifficulty(key)}>
                  {preset.label} · ⚡{preset.dailyActionPoints}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
          <button style={{ ...styles.primaryBtn, flex: 1 }} onClick={onStart}>Commencer</button>
          <button style={styles.smallBtn} onClick={onReroll}>🎲 Régénérer</button>
        </div>
      </div>
    </div>
  );
}
