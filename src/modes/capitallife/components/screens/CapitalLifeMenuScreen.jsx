import { useCapitalLifeColors, getStyles, DISPLAY_FONT } from "../../styles/theme.js";

export default function CapitalLifeMenuScreen({ hasSave, onResume, onNew, onOptions, onOpenManual, onExitHome }) {
  const C = useCapitalLifeColors();
  const styles = getStyles(C);

  const action = (primary = false) => ({
    ...(primary ? styles.primaryBtn : styles.smallBtn),
    width: "100%",
    minHeight: 48,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  });

  return (
    <div style={{ ...styles.app, alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
      <div className="screen-in" style={{ ...styles.card, width: "100%", maxWidth: 360, padding: "34px 24px 26px", boxSizing: "border-box", position: "relative" }}>
        <div aria-hidden="true" style={{ width: 70, height: 70, margin: "0 auto 18px", borderRadius: "50%", border: `1px dashed ${C.accent}`, display: "grid", placeItems: "center", background: `${C.accent}12`, fontSize: 30 }}>📅</div>
        <div style={{ fontSize: 10, letterSpacing: 2.4, color: C.inkSoft, textTransform: "uppercase" }}>Mode de gestion</div>
        <h1 style={{ fontFamily: DISPLAY_FONT, fontSize: 34, lineHeight: 1.05, color: C.ink, margin: "8px 0 8px", overflowWrap: "anywhere" }}>Capital Life</h1>
        <p style={{ fontSize: 12, lineHeight: 1.5, color: C.inkSoft, margin: "0 0 26px" }}>Faites évoluer votre situation, une décision financière à la fois.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
          {hasSave && <button className="cl-tap" style={action(true)} onClick={onResume}><span>▶</span>Reprendre</button>}
          <button className="cl-tap" style={action(!hasSave)} onClick={onNew}><span>🗂️</span>Nouvelle situation</button>
          <button className="cl-tap" style={action(false)} onClick={onOpenManual}><span>📖</span>Manuel</button>
          <button className="cl-tap" style={action(false)} onClick={onOptions}><span>⚙️</span>Options</button>
          <button className="cl-tap" style={{ ...action(false), background: "transparent", border: "none", color: C.inkSoft, boxShadow: "none" }} onClick={onExitHome}>← Autres modes de jeu</button>
        </div>
      </div>
    </div>
  );
}
