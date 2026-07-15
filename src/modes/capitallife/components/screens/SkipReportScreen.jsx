import { fmt } from "../../../../utils/format.js";
import { useCapitalLifeColors, getStyles } from "../../styles/theme.js";

function toneColor(tone, C) {
  if (tone === "good") return C.good;
  if (tone === "bad") return C.bad;
  if (tone === "warn") return C.warn;
  return C.inkSoft;
}

function EventRow({ title, detail, tone, C }) {
  return (
    <div style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: `1px solid ${C.line}` }}>
      <div style={{ width: 8, height: 8, borderRadius: 4, background: toneColor(tone, C), marginTop: 5, flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{title}</div>
        <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 2, lineHeight: 1.4 }}>{detail}</div>
      </div>
    </div>
  );
}

export default function SkipReportScreen({ report, currency, onBack }) {
  const C = useCapitalLifeColors();
  const styles = getStyles(C);
  const f = (n) => fmt(n, currency);

  if (!report) {
    return (
      <div style={styles.app}>
        <div style={styles.topBar}>
          <button className="cl-tap" style={styles.backBtn} onClick={onBack}>←</button>
          <div style={{ fontSize: 15, fontWeight: 700, flex: 1 }}>📋 Rapport</div>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center", color: C.inkSoft, fontSize: 13 }}>
          Aucun rapport disponible pour l'instant. Utilisez « Sauter jusqu'au mois prochain » pour en générer un.
        </div>
      </div>
    );
  }

  const delta = report.cashAfter - report.cashBefore;
  const payEvents = report.events.filter((e) => e.title === "Jour de paie");
  const lifeEvents = report.events.filter((e) => e.title !== "Jour de paie");

  return (
    <div style={styles.app}>
      <div style={styles.topBar}>
        <button className="cl-tap" style={styles.backBtn} onClick={onBack}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>📋 Rapport du mois</div>
          <div style={{ fontSize: 10, color: C.inkSoft, marginTop: 1 }}>
            Jour {report.fromDay} → {report.toDay} · {report.daysSkipped} jour{report.daysSkipped > 1 ? "s" : ""} · {report.mode === "calm" ? "Gestion prudente" : "Auto-résolution"}
          </div>
        </div>
      </div>

      <div style={{ ...styles.content, padding: 16 }}>
        <div style={styles.card}>
          <div style={{ padding: 16 }}>
            <div style={styles.sectionTitle}>Bilan de liquidités</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0" }}>
              <span style={{ color: C.inkSoft }}>Avant</span>
              <span style={{ ...styles.mono }}>{f(report.cashBefore)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0" }}>
              <span style={{ color: C.inkSoft }}>Après</span>
              <span style={{ ...styles.mono }}>{f(report.cashAfter)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderTop: `1px solid ${C.line}`, marginTop: 4 }}>
              <span style={{ fontWeight: 700, color: C.ink }}>Variation</span>
              <span style={{ ...styles.mono, fontWeight: 700, color: delta >= 0 ? C.good : C.bad }}>{delta >= 0 ? "+" : ""}{f(delta)}</span>
            </div>
          </div>
        </div>

        {report.interrupted && (
          <div style={{ fontSize: 11.5, color: C.warn, fontWeight: 700, padding: "10px 4px 0" }}>
            ⏸ Le saut s'est arrêté avant la fin prévue : une décision importante vous attend sur l'un de vos actifs.
          </div>
        )}

        {report.mode === "calm" && (
          <div style={{ fontSize: 11.5, color: C.inkSoft, fontStyle: "italic", padding: "10px 4px 0" }}>
            Gestion prudente : événements moins fréquents (bons comme mauvais), incidents résolus automatiquement avec l'option la plus sûre — la Bourse et le site d'opportunités ont continué d'évoluer normalement.
          </div>
        )}

        {payEvents.length > 0 && (
          <div style={{ ...styles.card, marginTop: 14 }}>
            <div style={{ padding: "14px 16px 4px" }}>
              <div style={styles.sectionTitle}>Jours de paie</div>
              {payEvents.map((e, i) => <EventRow key={i} title={e.title} detail={e.detail} tone={e.tone} C={C} />)}
            </div>
          </div>
        )}

        {lifeEvents.length > 0 && (
          <div style={{ ...styles.card, marginTop: 14 }}>
            <div style={{ padding: "14px 16px 4px" }}>
              <div style={styles.sectionTitle}>Événements</div>
              {lifeEvents.map((e, i) => <EventRow key={i} title={e.title} detail={e.detail} tone={e.tone} C={C} />)}
            </div>
          </div>
        )}

        {report.journalEntries.length > 0 && (
          <div style={{ ...styles.card, marginTop: 14 }}>
            <div style={{ padding: "14px 16px 4px" }}>
              <div style={styles.sectionTitle}>Marché</div>
              {report.journalEntries.map((e) => <EventRow key={e.id} title={e.title} detail={e.detail} tone={e.effect > 0 ? "good" : e.effect < 0 ? "bad" : "info"} C={C} />)}
            </div>
          </div>
        )}

        {payEvents.length === 0 && lifeEvents.length === 0 && report.journalEntries.length === 0 && (
          <div style={{ fontSize: 12.5, color: C.inkSoft, fontStyle: "italic", textAlign: "center", marginTop: 20 }}>
            Rien de particulier à signaler sur cette période.
          </div>
        )}
      </div>
    </div>
  );
}
