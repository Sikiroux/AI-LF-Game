import ModalShell from "../../../../components/modals/ModalShell.jsx";
import { useCapitalLifeColors, getStyles } from "../../styles/theme.js";

export default function AssetIncidentModal({ decision, actionPoints, onChoose }) {
  const C = useCapitalLifeColors();
  const styles = getStyles(C);
  if (!decision) return null;
  return (
    <ModalShell>
      <div style={{ fontSize: 10, color: C.bad, textTransform: "uppercase", letterSpacing: 2, fontWeight: 700 }}>Incident d'actif</div>
      <div style={{ fontFamily: "Georgia, serif", fontSize: 19, color: C.ink, marginTop: 5, fontWeight: 700 }}>{decision.title}</div>
      <div style={{ display: "grid", gap: 9, marginTop: 16 }}>
        {decision.options.map((option) => {
          const disabled = actionPoints != null && actionPoints < option.paCost;
          return (
            <button className="cl-tap" key={option.key} style={{ ...styles.card, padding: 12, textAlign: "left", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.45 : 1 }} disabled={disabled} onClick={() => onChoose(option.key)}>
              <div style={{ color: C.ink, fontWeight: 700, fontSize: 13 }}>{option.label}{option.paCost > 0 ? ` · ⚡${option.paCost}` : ""}</div>
              <div style={{ color: C.inkSoft, fontSize: 11.5, lineHeight: 1.45, marginTop: 3 }}>{option.detail}</div>
            </button>
          );
        })}
      </div>
    </ModalShell>
  );
}
