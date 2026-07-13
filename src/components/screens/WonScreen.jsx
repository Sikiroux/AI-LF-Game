import { fmt } from "../../utils/format.js";
import { styles, COLORS, CSS_EXTRA } from "../../styles/theme.js";

export default function WonScreen({ fastTrack, winReason, turnCount, onReset, currency }) {
  const isDream = winReason === "dream";
  return (
    <div style={{ ...styles.app, alignItems: "center", justifyContent: "center", display: "flex", flexDirection: "column", textAlign: "center", padding: 24 }}>
      <style>{CSS_EXTRA}</style>
      <div style={styles.bigStamp}>LIBERTÉ</div>
      <div style={{ fontSize: 46, marginTop: 14 }}>{isDream ? (fastTrack?.dream?.icon || "🏆") : "💹"}</div>
      <div style={{ fontFamily: "Georgia, serif", fontSize: 24, color: COLORS.ink, marginTop: 8, fontWeight: 700 }}>Passeport tamponné !</div>
      {isDream ? (
        <div style={{ color: COLORS.inkSoft, marginTop: 8, maxWidth: 340 }}>
          Vous avez réalisé votre rêve : <b style={{ color: COLORS.ink }}>{fastTrack?.dream?.title}</b> ({fmt(fastTrack?.dream?.cost || 0, currency)})
        </div>
      ) : (
        <div style={{ color: COLORS.inkSoft, marginTop: 8, maxWidth: 340 }}>
          Vous avez atteint <b style={{ color: COLORS.ink }}>{fmt(fastTrack?.targetIncome || 0, currency)}</b> de revenu voie rapide par tour !
        </div>
      )}
      <div style={{ color: COLORS.inkSoft, fontSize: 13, marginTop: 6 }}>Terminé en {turnCount} tours.</div>
      <button className="btn-primary" style={{ ...styles.primaryBtn, marginTop: 24 }} onClick={onReset}>Nouvelle partie</button>
    </div>
  );
}
