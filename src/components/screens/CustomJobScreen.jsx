import { useState } from "react";
import { EXPENSE_FIELDS } from "../../data/professions.js";
import { fmt, toEUR, uid } from "../../utils/format.js";
import { RATES_FROM_EUR, CURRENCIES } from "../../data/currencies.js";
import { styles, COLORS, CSS_EXTRA } from "../../styles/theme.js";

export default function CustomJobScreen({ customJobs, onCreate, onDelete, onBack, currency }) {
  const rate = RATES_FROM_EUR[currency] || 1;
  const cfg = CURRENCIES[currency];
  const [name, setName] = useState("");
  const [salary, setSalary] = useState(Math.round(3000 * rate));
  const [cashStart, setCashStart] = useState(Math.round(1500 * rate));
  const [perChild, setPerChild] = useState(Math.round(130 * rate));
  const [enabled, setEnabled] = useState(Object.fromEntries(EXPENSE_FIELDS.map((f) => [f.key, true])));
  const [amounts, setAmounts] = useState(Object.fromEntries(EXPENSE_FIELDS.map((f) => [f.key, Math.round(f.def * rate)])));

  function toggle(key) { setEnabled((e) => ({ ...e, [key]: !e[key] })); }
  function setAmount(key, v) { setAmounts((a) => ({ ...a, [key]: v })); }

  function submit() {
    if (!name.trim() || Number(salary) <= 0) return;
    const expenses = Object.fromEntries(EXPENSE_FIELDS.map((f) => [f.key, enabled[f.key] ? Math.max(0, toEUR(amounts[f.key], currency)) : 0]));
    const job = {
      id: "custom-" + uid(),
      name: name.trim(),
      icon: "💼",
      salary: Math.max(0, toEUR(salary, currency)),
      expenses,
      liabilities: { mortgage: 0, carLoan: 0, creditCard: 0, schoolLoan: 0 },
      perChild: Math.max(0, toEUR(perChild, currency)),
      cash: Math.max(0, toEUR(cashStart, currency)),
      savings: 0,
      custom: true,
    };
    onCreate(job);
    setName(""); setSalary(Math.round(3000 * rate)); setCashStart(Math.round(1500 * rate)); setPerChild(Math.round(130 * rate));
    setEnabled(Object.fromEntries(EXPENSE_FIELDS.map((f) => [f.key, true])));
    setAmounts(Object.fromEntries(EXPENSE_FIELDS.map((f) => [f.key, Math.round(f.def * rate)])));
  }

  return (
    <div style={{ ...styles.app, overflowY: "auto", padding: "26px 18px 40px", alignItems: "center", display: "flex", flexDirection: "column" }}>
      <style>{CSS_EXTRA}</style>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <button className="btn-small" style={{ ...styles.smallBtn, marginBottom: 16 }} onClick={onBack}>← Menu</button>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 22, color: COLORS.ink, fontWeight: 700, marginBottom: 4, textAlign: "center" }}>Métiers personnalisés</div>
        <div style={{ textAlign: "center", fontSize: 11, color: COLORS.inkSoft, marginBottom: 16 }}>Tous les montants ci-dessous sont en {cfg.label} ({cfg.symbol})</div>

        {customJobs.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <div style={styles.sectionLabel}>Déjà créés</div>
            {customJobs.map((p) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: COLORS.card, border: `1px dashed ${COLORS.inkSoft}`, borderRadius: 8, padding: "8px 12px", marginBottom: 6 }}>
                <div style={{ fontSize: 13, color: COLORS.ink }}>{p.icon} {p.name} — {fmt(p.salary, currency)}</div>
                <button className="btn-small" style={{ ...styles.smallBtnDanger, padding: "4px 8px" }} onClick={() => onDelete(p.id)}>Suppr.</button>
              </div>
            ))}
          </div>
        )}

        <div style={styles.sectionLabel}>Nouveau métier</div>
        <label style={styles.formLabel}>Nom du métier</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex : Développeur·euse" style={styles.formInput} />

        <label style={styles.formLabel}>Salaire mensuel ({cfg.symbol})</label>
        <input type="number" value={salary} onChange={(e) => setSalary(e.target.value)} style={styles.formInput} />

        <label style={styles.formLabel}>Liquidités de départ ({cfg.symbol})</label>
        <input type="number" value={cashStart} onChange={(e) => setCashStart(e.target.value)} style={styles.formInput} />

        <label style={styles.formLabel}>Coût par enfant ({cfg.symbol})</label>
        <input type="number" value={perChild} onChange={(e) => setPerChild(e.target.value)} style={styles.formInput} />

        <div style={{ ...styles.sectionLabel, marginTop: 18 }}>Dépenses en {cfg.symbol} (cochez celles à inclure)</div>
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

        <button className="btn-primary" style={{ ...styles.primaryBtn, width: "100%", boxSizing: "border-box", marginTop: 18 }} onClick={submit}>Créer ce métier</button>
      </div>
    </div>
  );
}
