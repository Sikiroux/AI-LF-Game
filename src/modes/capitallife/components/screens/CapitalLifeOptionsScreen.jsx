import { CURRENCIES, CURRENCY_ORDER } from "../../../../data/currencies.js";
import { styles, COLORS, CSS_EXTRA } from "../../../../styles/theme.js";

export default function CapitalLifeOptionsScreen({ currency, onSelectCurrency, babyEnabled, onToggleBaby, layoffEnabled, onToggleLayoff, skipMonthMode, onChangeSkipMonthMode, onBack }) {
  return (
    <div className="screen-in" style={{ ...styles.app, overflowY: "auto", padding: "26px 18px 40px", alignItems: "center", display: "flex", flexDirection: "column" }}>
      <style>{CSS_EXTRA}</style>
      <div style={{ width: "100%", maxWidth: 340 }}>
        <button className="btn-small" style={{ ...styles.smallBtn, marginBottom: 20 }} onClick={onBack}>← Menu</button>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 22, color: COLORS.ink, fontWeight: 700, marginBottom: 18, textAlign: "center" }}>Options — Capital Life</div>

        <div style={styles.sectionLabel}>Devise</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 6 }}>
          {CURRENCY_ORDER.map((code) => (
            <button key={code} className="chip-btn" style={{ ...styles.currencyChip, ...(currency === code ? styles.currencyChipActive : {}) }} onClick={() => onSelectCurrency(code)}>
              <span style={{ fontWeight: 700 }}>{CURRENCIES[code].symbol}</span> {CURRENCIES[code].label}
            </button>
          ))}
        </div>
        <div style={{ textAlign: "center", fontSize: 10, color: COLORS.inkSoft, marginBottom: 26 }}>Montants calculés en euros, convertis au taux actuel.</div>

        <div style={styles.sectionLabel}>Événements de vie</div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: COLORS.ink, marginBottom: 6, justifyContent: "center" }}>
          <input type="checkbox" checked={babyEnabled} onChange={onToggleBaby} />
          👶 Bébés (max 3, au moins 9 mois d'écart)
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: COLORS.ink, marginBottom: 26, justifyContent: "center" }}>
          <input type="checkbox" checked={layoffEnabled} onChange={onToggleLayoff} />
          📉 Licenciement (2 mois sans salaire, au moins 6 mois d'écart)
        </label>

        <div style={styles.sectionLabel}>Sauter le mois</div>
        <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginBottom: 6 }}>
          <button className="chip-btn" style={{ ...styles.currencyChip, ...(skipMonthMode === "auto" ? styles.currencyChipActive : {}) }} onClick={() => onChangeSkipMonthMode("auto")}>Auto-résolution</button>
          <button className="chip-btn" style={{ ...styles.currencyChip, ...(skipMonthMode === "calm" ? styles.currencyChipActive : {}) }} onClick={() => onChangeSkipMonthMode("calm")}>Mois calme</button>
        </div>
        <div style={{ textAlign: "center", fontSize: 10, color: COLORS.inkSoft, marginBottom: 12 }}>
          {skipMonthMode === "auto"
            ? "Les événements du mois se déclenchent normalement en arrière-plan."
            : "Aucun événement de vie pendant le saut — la Bourse et le site d'annonces continuent d'évoluer."}
        </div>
      </div>
    </div>
  );
}
