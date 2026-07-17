import { fmt } from "../../../../utils/format.js";
import { useCapitalLifeColors, getStyles, DISPLAY_FONT } from "../../styles/theme.js";

/* Hallmark · genre: playful · macrostructure: Outcome ledger · design-system: design.md · designed-as-app
 * Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V4 · contrast: pass · responsive: pass */

export default function ChallengeResultScreen({ success, progress, challenge, currency, onReset }) {
  const C = useCapitalLifeColors();
  const styles = getStyles(C);
  const tone = success ? C.good : C.bad;
  const checks = progress?.secondary || {};
  return (
    <div style={{ ...styles.app, overflowY: "auto", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 440, margin: "auto" }}>
        <div style={{ color: tone, fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>{success ? "Défi réussi" : "Échéance atteinte"}</div>
        <h1 style={{ fontFamily: DISPLAY_FONT, fontSize: 30, lineHeight: 1.08, color: C.ink, margin: "10px 0" }}>{challenge.title}</h1>
        <p style={{ color: C.inkSoft, lineHeight: 1.55 }}>{success ? "Toutes les dettes ont été remboursées avant la date limite." : `Il reste ${fmt(progress.debtRemaining, currency)} à rembourser.`}</p>
        <div style={{ ...styles.card, padding: 16, marginTop: 16 }}>
          {[["Dette remboursée", `${progress.debtProgressPct}%`], ["Réserve d'un mois", checks.reserve ? "Atteinte" : "Non atteinte"], ["Cash-flow positif", checks.positiveCashflow ? "Oui" : "Non"], ["Sans crédit d'urgence", checks.noEmergencyCredit ? "Oui" : "Non"]].map(([label, value]) => <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "9px 0", borderBottom: `1px solid ${C.line}`, fontSize: 13 }}><span style={{ color: C.inkSoft }}>{label}</span><b style={{ color: C.ink }}>{value}</b></div>)}
        </div>
        <button className="cl-tap" style={{ ...styles.primaryBtn, width: "100%", marginTop: 20, minHeight: 50 }} onClick={onReset}>Revenir au menu</button>
      </div>
    </div>
  );
}
