import { styles, COLORS, CSS_EXTRA } from "../../styles/theme.js";

export default function HomeScreen({ onSelectClassic, onSelectRatRace2 }) {
  return (
    <div style={{ ...styles.app, alignItems: "center", justifyContent: "center", display: "flex", flexDirection: "column", padding: 24, textAlign: "center" }}>
      <style>{CSS_EXTRA}</style>
      <div className="screen-in" style={{ ...styles.menuCover, width: "100%", maxWidth: 360, boxSizing: "border-box" }}>
        <div className="menu-watermark" style={styles.menuWatermark}>🧭</div>
        <div style={{ fontSize: 11, letterSpacing: 3, color: COLORS.inkSoft, textTransform: "uppercase" }}>Le jeu de la</div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 32, color: COLORS.ink, fontWeight: 700, letterSpacing: 0.5, marginBottom: 4 }}>Liberté Financière</div>
        <div style={{ fontSize: 11, color: COLORS.inkSoft, marginBottom: 24 }}>Choisissez votre façon de sortir de la course infernale.</div>

        <div className="menu-stagger" style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
          <button className="prof-card" style={{ ...styles.profCard, textAlign: "left", display: "flex", alignItems: "center", gap: 12 }} onClick={onSelectClassic}>
            <span style={{ fontSize: 26 }}>🎲</span>
            <span>
              <span style={{ display: "block", fontFamily: "Georgia, serif", fontSize: 15, color: COLORS.ink, fontWeight: 700 }}>Mode classique</span>
              <span style={{ display: "block", fontSize: 11, color: COLORS.inkSoft, marginTop: 2 }}>Plateau, dé, course infernale et voie rapide.</span>
            </span>
          </button>

          <button className="prof-card" style={{ ...styles.profCard, textAlign: "left", display: "flex", alignItems: "center", gap: 12 }} onClick={onSelectRatRace2}>
            <span style={{ fontSize: 26 }}>📅</span>
            <span>
              <span style={{ display: "block", fontFamily: "Georgia, serif", fontSize: 15, color: COLORS.ink, fontWeight: 700 }}>Rat Race 2</span>
              <span style={{ display: "block", fontSize: 11, color: COLORS.inkSoft, marginTop: 2 }}>Progression mois par mois, bourse vivante, site d'opportunités.</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
