import { CURRENCIES, CURRENCY_ORDER } from "../../../../data/currencies.js";
import { useCapitalLifeColors, getStyles } from "../../styles/theme.js";
import { MANAGEMENT_THRESHOLD_OPTIONS } from "../../engine/assetIndicators.js";
import { DAILY_ACTION_POINTS_OPTIONS } from "../../engine/actionPoints.js";

export default function CapitalLifeOptionsScreen({ currency, onSelectCurrency, babyEnabled, onToggleBaby, layoffEnabled, onToggleLayoff, skipMonthMode, onChangeSkipMonthMode, managementThresholdPct, onChangeManagementThreshold, dailyActionPoints, onChangeDailyActionPoints, onBack }) {
  const C = useCapitalLifeColors();
  const styles = getStyles(C);
  return (
    <div style={styles.app}>
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={onBack}>←</button>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>⚙️ Options — Capital Life</div>
      </div>

      <div style={{ ...styles.content, padding: 16 }}>
        <div style={{ ...styles.card, padding: 16, marginBottom: 14 }}>
          <div style={styles.sectionTitle}>Devise</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CURRENCY_ORDER.map((code) => (
              <button key={code} style={{ ...styles.chip, ...(currency === code ? styles.chipActive : {}) }} onClick={() => onSelectCurrency(code)}>
                <span style={{ fontWeight: 700 }}>{CURRENCIES[code].symbol}</span> {CURRENCIES[code].label}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 10, color: C.inkSoft, marginTop: 8 }}>Montants calculés en euros, convertis au taux actuel.</div>
        </div>

        <div style={{ ...styles.card, padding: 16, marginBottom: 14 }}>
          <div style={styles.sectionTitle}>Événements de vie</div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: C.ink, marginBottom: 10 }}>
            <input type="checkbox" checked={babyEnabled} onChange={onToggleBaby} />
            👶 Bébés (max 3, au moins 9 mois d'écart)
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: C.ink }}>
            <input type="checkbox" checked={layoffEnabled} onChange={onToggleLayoff} />
            📉 Licenciement (2 mois sans salaire, au moins 6 mois d'écart)
          </label>
        </div>

        <div style={{ ...styles.card, padding: 16, marginBottom: 14 }}>
          <div style={styles.sectionTitle}>Points d'action par jour</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            {DAILY_ACTION_POINTS_OPTIONS.map((n) => (
              <button key={n} style={{ ...styles.chip, ...(dailyActionPoints === n ? styles.chipActive : {}) }} onClick={() => onChangeDailyActionPoints(n)}>
                ⚡ {n}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 10, color: C.inkSoft }}>
            Budget quotidien pour gérer vos actifs, vous former ou faire des missions. Le surmenage se mesure par rapport à ce budget : le dépenser en entier plusieurs jours d'affilée augmente le risque de burnout.
          </div>
        </div>

        <div style={{ ...styles.card, padding: 16, marginBottom: 14 }}>
          <div style={styles.sectionTitle}>Seuil de contrôle des entreprises</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            {MANAGEMENT_THRESHOLD_OPTIONS.map((pct) => (
              <button key={pct} style={{ ...styles.chip, ...(managementThresholdPct === pct ? styles.chipActive : {}) }} onClick={() => onChangeManagementThreshold(pct)}>
                {pct}% {pct === 50 ? "(majorité)" : "(contrôle total)"}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 10, color: C.inkSoft }}>
            Sur une entreprise détenue en parts (achat "(part)"), la gestion du personnel (recruter/former/licencier) ne se débloque qu'à partir de ce pourcentage de participation.
          </div>
        </div>

        <div style={{ ...styles.card, padding: 16 }}>
          <div style={styles.sectionTitle}>Sauter le mois</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            <button style={{ ...styles.chip, ...(skipMonthMode === "auto" ? styles.chipActive : {}) }} onClick={() => onChangeSkipMonthMode("auto")}>Auto-résolution</button>
            <button style={{ ...styles.chip, ...(skipMonthMode === "calm" ? styles.chipActive : {}) }} onClick={() => onChangeSkipMonthMode("calm")}>Mois calme</button>
          </div>
          <div style={{ fontSize: 10.5, color: C.inkSoft }}>
            {skipMonthMode === "auto"
              ? "Les événements du mois se déclenchent normalement en arrière-plan."
              : "Aucun événement de vie pendant le saut — la Bourse et le site d'annonces continuent d'évoluer."}
          </div>
        </div>
      </div>
    </div>
  );
}
