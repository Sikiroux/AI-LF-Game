import { fmt } from "../../../../utils/format.js";
import { useCapitalLifeColors, getStyles, DISPLAY_FONT } from "../../styles/theme.js";

export default function CapitalLifeWonScreen({ day, profession, assets, passiveIncome, debts, currency, onReset }) {
  const C = useCapitalLifeColors();
  const styles = getStyles(C);
  const month = Math.floor((day - 1) / 30) + 1;
  const debtRemaining = debts.reduce((sum, debt) => sum + debt.balance, 0);

  return (
    <div className="screen-in" style={{ ...styles.app, overflowY: "auto", alignItems: "center", padding: 24, textAlign: "center" }}>
      <div style={{ width: "100%", maxWidth: 440, margin: "auto" }}>
        <div style={{ width: 82, height: 82, margin: "0 auto 18px", borderRadius: "50%", display: "grid", placeItems: "center", background: `${C.good}20`, border: `1px solid ${C.good}`, fontSize: 40 }}>🏆</div>
        <div style={{ color: C.good, fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase" }}>Indépendance atteinte</div>
        <h1 style={{ fontFamily: DISPLAY_FONT, fontSize: 30, lineHeight: 1.08, color: C.ink, margin: "10px 0", overflowWrap: "anywhere" }}>Vous êtes sorti·e de la course infernale !</h1>
        <p style={{ color: C.inkSoft, lineHeight: 1.55, margin: "0 auto 20px", maxWidth: 380 }}>
          Vos revenus passifs de <strong style={{ color: C.good }}>{fmt(passiveIncome, currency)}/mois</strong> couvrent désormais vos dépenses.
        </p>
        <div style={{ ...styles.card, padding: 18, textAlign: "left" }}>
          {[
            ["Temps nécessaire", `${month} mois · ${day} jours`],
            ["Situation de départ", `${profession?.icon || "💼"} ${profession?.name || "Profession"}`],
            ["Actifs acquis", assets.length],
            ["Dette restante", fmt(debtRemaining, currency)],
          ].map(([label, value]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "9px 0", borderBottom: `1px solid ${C.line}`, fontSize: 13 }}>
              <span style={{ color: C.inkSoft }}>{label}</span><strong style={{ color: C.ink, textAlign: "right" }}>{value}</strong>
            </div>
          ))}
        </div>
        <button className="cl-tap" style={{ ...styles.primaryBtn, width: "100%", marginTop: 20, minHeight: 50 }} onClick={onReset}>Nouvelle situation</button>
      </div>
    </div>
  );
}
