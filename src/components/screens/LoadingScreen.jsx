import { styles, COLORS } from "../../styles/theme.js";

export default function LoadingScreen() {
  return (
    <div style={{ ...styles.app, alignItems: "center", justifyContent: "center", display: "flex" }}>
      <div style={{ color: COLORS.ink, fontFamily: "Georgia, serif", fontSize: 18 }}>Chargement du passeport…</div>
    </div>
  );
}
