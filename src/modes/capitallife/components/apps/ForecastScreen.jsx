import { fmt } from "../../../../utils/format.js";
import { computeForecast } from "../../engine/forecast.js";
import { useCapitalLifeColors, getStyles, FONT_DISPLAY } from "../../styles/theme.js";

function Row({ label, value, tone, bold, C }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13, padding: "7px 0", borderBottom: `1px solid ${C.line}` }}>
      <span style={{ color: bold ? C.ink : C.inkSoft, fontWeight: bold ? 700 : 400 }}>{label}</span>
      <span style={{ fontFamily: "ui-monospace, monospace", textAlign: "right", fontWeight: bold ? 700 : 400, color: tone === "good" ? C.good : tone === "bad" ? C.bad : C.ink }}>{value}</span>
    </div>
  );
}

function debtLabel(ratio) {
  if (ratio <= 0.25) return { label: "Sain", tone: "good" };
  if (ratio <= 0.4) return { label: "Tendu", tone: undefined };
  return { label: "Critique", tone: "bad" };
}

function runwayLabel(months) {
  if (months >= 6) return { label: "Solide", tone: "good" };
  if (months >= 3) return { label: "Prudente", tone: undefined };
  return { label: "Fragile", tone: "bad" };
}

export default function ForecastScreen({ day, cash, profession, debts, liabilities, kids, assets, rentTier, currency, onBack }) {
  const C = useCapitalLifeColors();
  const styles = getStyles(C);
  const forecast = computeForecast({ day, cash, profession, debts, liabilities, kids, assets, rentTier });
  const f = (value) => fmt(value, currency);
  if (!forecast) return null;
  const debt = debtLabel(forecast.debtRatio);
  const runway = runwayLabel(forecast.monthsOfRunway);

  return (
    <div style={styles.app}>
      <div style={styles.topBar}>
        <button className="cl-tap" style={styles.backBtn} onClick={onBack}>←</button>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, fontWeight: 600, flex: 1 }}>Prévisions</div>
        <div style={{ width: 30 }} />
      </div>
      <div style={{ ...styles.content, padding: 16 }}>
        <div style={styles.card}>
          <div style={{ padding: 16 }}>
            <div style={styles.sectionTitle}>Prochain mois</div>
            <Row C={C} label="Prochaine paie" value={`Jour ${forecast.nextPaydayDay} · dans ${forecast.daysUntilPayday} jours`} />
            <Row C={C} label="Solde mensuel attendu" value={`${forecast.expectedPayday >= 0 ? "+" : ""}${f(forecast.expectedPayday)}`} tone={forecast.expectedPayday >= 0 ? "good" : "bad"} bold />
          </div>
        </div>

        <div style={{ ...styles.card, marginTop: 14 }}>
          <div style={{ padding: 16 }}>
            <div style={styles.sectionTitle}>Résilience financière</div>
            <Row C={C} label="Réserve de sécurité" value={`${Number.isFinite(forecast.monthsOfRunway) ? forecast.monthsOfRunway.toFixed(1) : "∞"} mois · ${runway.label}`} tone={runway.tone} bold />
            <Row C={C} label="Endettement" value={`${Number.isFinite(forecast.debtRatio) ? Math.round(forecast.debtRatio * 100) : "∞"}% · ${debt.label}`} tone={debt.tone} />
            <Row C={C} label="Patrimoine net estimé" value={f(forecast.netWorth)} tone={forecast.netWorth >= 0 ? "good" : "bad"} />
          </div>
        </div>

        <div style={{ ...styles.card, marginTop: 14 }}>
          <div style={{ padding: 16 }}>
            <div style={styles.sectionTitle}>Entretien à anticiper</div>
            {forecast.upcomingMaintenance.length === 0 ? (
              <div style={{ fontSize: 12.5, color: C.inkSoft }}>Aucun actif ne redevient entretenable dans les sept prochains jours.</div>
            ) : forecast.upcomingMaintenance.map((asset) => (
              <Row key={asset.id} C={C} label={asset.name} value={asset.daysUntilEligible === 0 ? "Disponible" : `Dans ${asset.daysUntilEligible} jours`} tone={asset.daysUntilEligible === 0 ? "good" : undefined} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
