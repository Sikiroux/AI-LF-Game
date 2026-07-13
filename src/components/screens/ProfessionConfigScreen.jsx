import { useState } from "react";
import { EXPENSE_FIELDS } from "../../data/professions.js";
import { calcExpenses } from "../../engine/financing.js";
import { fmt, toEUR } from "../../utils/format.js";
import { RATES_FROM_EUR, CURRENCIES } from "../../data/currencies.js";
import { styles, COLORS, CSS_EXTRA } from "../../styles/theme.js";

export default function ProfessionConfigScreen({ profession, currency, onBack, onConfirm }) {
  const rate = RATES_FROM_EUR[currency] || 1;
  const cfg = CURRENCIES[currency];
  const [kids, setKids] = useState(0);
  const [enabled, setEnabled] = useState(Object.fromEntries(EXPENSE_FIELDS.map((f) => [f.key, profession.expenses[f.key] > 0])));
  const [amounts, setAmounts] = useState(Object.fromEntries(EXPENSE_FIELDS.map((f) => [f.key, Math.round(profession.expenses[f.key] * rate)])));

  function toggle(key) { setEnabled((e) => ({ ...e, [key]: !e[key] })); }
  function setAmount(key, v) { setAmounts((a) => ({ ...a, [key]: v })); }
  function resetDefaults() {
    setEnabled(Object.fromEntries(EXPENSE_FIELDS.map((f) => [f.key, profession.expenses[f.key] > 0])));
    setAmounts(Object.fromEntries(EXPENSE_FIELDS.map((f) => [f.key, Math.round(profession.expenses[f.key] * rate)])));
    setKids(0);
  }

  function confirm() {
    const expenses = Object.fromEntries(EXPENSE_FIELDS.map((f) => [f.key, enabled[f.key] ? Math.max(0, toEUR(amounts[f.key], currency)) : 0]));
    onConfirm({ ...profession, expenses }, kids);
  }

  const previewExpenses = calcExpenses({ expenses: Object.fromEntries(EXPENSE_FIELDS.map((f) => [f.key, enabled[f.key] ? toEUR(amounts[f.key], currency) : 0])), perChild: profession.perChild }, kids, 0);

  return (
    <div style={{ ...styles.app, overflowY: "auto", padding: "26px 18px 40px", alignItems: "center", display: "flex", flexDirection: "column" }}>
      <style>{CSS_EXTRA}</style>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <button className="btn-small" style={{ ...styles.smallBtn, marginBottom: 16 }} onClick={onBack}>← Métiers</button>
        <div style={{ textAlign: "center", marginBottom: 4 }}>
          <div style={{ fontSize: 28 }}>{profession.icon}</div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 20, color: COLORS.ink, fontWeight: 700 }}>{profession.name}</div>
          <div style={{ fontSize: 12, color: COLORS.teal, fontFamily: "'Courier New', monospace", marginTop: 2 }}>Salaire {fmt(profession.salary, currency)}</div>
        </div>

        <div style={{ ...styles.sectionLabel, marginTop: 18 }}>Nombre d'enfants au départ</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 20 }}>
          {[0, 1, 2, 3].map((n) => (
            <button key={n} className="chip-btn" style={{ ...styles.currencyChip, ...(kids === n ? styles.currencyChipActive : {}) }} onClick={() => setKids(n)}>{n}</button>
          ))}
        </div>

        <div style={styles.sectionLabel}>Charges en {cfg.symbol} (cochez celles à inclure)</div>
        {EXPENSE_FIELDS.map((f) => (
          <div key={f.key} style={styles.expenseRow}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: COLORS.ink, flex: 1 }}>
              <input type="checkbox" checked={enabled[f.key]} onChange={() => toggle(f.key)} />
              {f.label}
            </label>
            <input
              type="number"
              value={amounts[f.key]}
              disabled={!enabled[f.key]}
              onChange={(e) => setAmount(f.key, e.target.value)}
              style={{ ...styles.formInputSmall, opacity: enabled[f.key] ? 1 : 0.4 }}
            />
          </div>
        ))}

        <div style={{ marginTop: 14, fontSize: 12, color: COLORS.inkSoft, textAlign: "center" }}>
          Dépenses totales estimées : <b style={{ color: COLORS.ink }}>{fmt(previewExpenses, currency)}</b> / mois
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
          <button className="btn-primary" style={{ ...styles.primaryBtn, flex: 1 }} onClick={confirm}>Commencer</button>
          <button className="btn-small" style={styles.smallBtn} onClick={resetDefaults}>Défaut</button>
        </div>
      </div>
    </div>
  );
}
