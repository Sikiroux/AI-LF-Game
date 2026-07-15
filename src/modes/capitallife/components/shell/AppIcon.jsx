import { useCapitalLifeColors, getStyles } from "../../styles/theme.js";
import { ICON_BASE, AVAILABLE_ICONS } from "../../data/imageManifest.js";

// Icône d'application avec emplacement d'image nommé — tant qu'une image
// donnée n'a pas encore été fournie (cf. imageManifest.js), affiche l'emoji
// de secours dans un cadre hachuré portant le nom du fichier attendu.
export default function AppIcon({ emoji, label, file, size = 56, onClick, badge }) {
  const C = useCapitalLifeColors();
  const styles = getStyles(C);
  const hasImage = file && AVAILABLE_ICONS.has(file);
  return (
    <button
      onClick={onClick}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, background: "transparent", border: "none", cursor: onClick ? "pointer" : "default", padding: 0, font: "inherit", color: "inherit" }}
    >
      <div style={{ ...styles.placeholderImg, width: size, height: size, borderRadius: Math.round(size * 0.25), fontSize: size * 0.42, position: "relative", overflow: "hidden" }}>
        {hasImage ? (
          <img src={`${ICON_BASE}${file}`} alt={label || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          emoji
        )}
        {badge != null && badge > 0 && (
          <span style={{ position: "absolute", top: -4, right: -4, background: C.bad, color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 999, minWidth: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>
            {badge}
          </span>
        )}
      </div>
      {label && <div style={{ fontSize: 10.5, textAlign: "center", color: C.ink, lineHeight: 1.2 }}>{label}</div>}
      {!hasImage && file && <div style={{ fontSize: 7.5, color: C.inkSoft, textAlign: "center", fontFamily: "ui-monospace, monospace", wordBreak: "break-all", lineHeight: 1.3 }}>{file}</div>}
    </button>
  );
}
