import { useState, useEffect } from "react";
import { SECTOR_COLORS } from "../../../data/sectors.js";

// Palette dédiée à Capital Life — complètement séparée du thème "passeport
// financier" du mode classique (src/styles/theme.js), pour zéro risque de
// collision. Deux jeux de couleurs (clair/sombre) suivis en JS plutôt qu'en
// CSS, cohérent avec le reste du projet qui construit ses styles en objets
// inline plutôt qu'en classes.
export const LIGHT_COLORS = {
  bg: "#EEF1F8", surface: "#FFFFFF", surfaceRaised: "#E3E8F3",
  ink: "#141D33", inkSoft: "#5C6680", line: "#D6DCEA",
  accent: "#2F6FE0", accentInk: "#FFFFFF",
  good: "#1FA968", bad: "#E5484D", warn: "#C9820A",
  catImmo: "#C96A32", catBiz: "#1E9C77", catActions: "#2F6FE0", catEncheres: "#8E5AC9",
  placeholderBg: "#E3E8F3", placeholderLine: "#B7C0D6",
};
export const DARK_COLORS = {
  bg: "#0B1220", surface: "#141D33", surfaceRaised: "#1C2846",
  ink: "#E9EDF6", inkSoft: "#8993AC", line: "#2A3555",
  accent: "#5A96FF", accentInk: "#0B1220",
  good: "#35C77E", bad: "#FF6B6B", warn: "#F0A93E",
  catImmo: "#E28A55", catBiz: "#3FBF95", catActions: "#5A96FF", catEncheres: "#B189E8",
  placeholderBg: "#1C2846", placeholderLine: "#3A4770",
};

export function usePrefersDarkMode() {
  const [dark, setDark] = useState(
    () => typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return dark;
}

export function useCapitalLifeColors() {
  const dark = usePrefersDarkMode();
  return dark ? DARK_COLORS : LIGHT_COLORS;
}

// Styles partagés dérivés des couleurs courantes. Appelé après le hook
// ci-dessus dans chaque composant : `const styles = getStyles(COLORS)`.
// Largeur max du contenu lisible (cartes, listes, formulaires) sur desktop —
// le fond de l'appli (barre du haut, bandeaux, pied de page) reste sur toute
// la largeur de la fenêtre ; seul le contenu à lire se recentre au lieu de
// s'étirer edge-to-edge, ce qui rendait certains blocs (ex. compte de
// résultat) difficiles à lire. N'a aucun effet sur mobile/APK, où la fenêtre
// est déjà plus étroite que ce seuil.
export const CONTENT_MAX_WIDTH = 560;

// Échelle d'espacement (base 4pt) et de radius — nommées plutôt que des px
// éparpillés au fil des fichiers, pour que padding/radius se répondent d'un
// composant à l'autre au lieu de dériver légèrement partout.
export const SPACE = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const RADIUS = { xs: 6, sm: 8, md: 12, lg: 16, pill: 999 };

// Retour tactile universel : tout élément cliquable de Capital Life porte
// cette classe (en plus de son style inline) pour un vrai feedback de
// pression — sans elle, les boutons en style inline n'avaient aucune
// animation au tap, contrairement au mode classique qui a déjà `.btn-primary
// :active` etc. via CSS_EXTRA. Injectée une seule fois au niveau racine
// (App.jsx) pour couvrir tous les écrans sans dupliquer une balise <style>
// partout.
export const CL_CSS_EXTRA = `
  .cl-tap {
    transition: transform 0.12s ease-out, opacity 0.12s ease-out, filter 0.12s ease-out;
    -webkit-tap-highlight-color: transparent;
  }
  .cl-tap:active { transform: scale(0.96); opacity: 0.82; }
  @media (hover: hover) {
    .cl-tap:hover { filter: brightness(1.06); }
  }
  .cl-tap:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }

  /* DecisionModal.jsx (partagé avec le mode classique) est utilisé tel quel
     pour le flux d'achat OppMarket — mêmes classes que le mode classique,
     pour que le retour tactile marche là aussi sans dupliquer le composant. */
  .btn-primary, .btn-small {
    transition: transform 0.12s ease-out, opacity 0.12s ease-out;
  }
  .btn-primary:active, .btn-small:active { transform: scale(0.96); opacity: 0.85; }
`;

// Badge coloré par secteur (immobilier, tech, finance...) réutilisant la
// palette déjà définie dans data/sectors.js — remplace un simple libellé
// gris uniforme par une pastille qui porte l'info d'un coup d'œil, au lieu
// de tout aplatir en texte.
export function sectorBadge(sector, C) {
  return {
    display: "inline-flex", alignItems: "center", fontSize: 9.5, fontWeight: 700,
    textTransform: "uppercase", letterSpacing: "0.04em", color: "#fff",
    padding: `${SPACE.xs - 1}px ${SPACE.sm}px`, borderRadius: RADIUS.pill,
    background: SECTOR_COLORS[sector] || C.inkSoft,
  };
}

// Petite jauge qualitative (état, réputation, fiabilité...) — un repère
// visuel en plus du texte plutôt qu'une ligne de plus dans une liste.
export function qualityTone(label, C) {
  if (label === "Excellent" || label === "Bon" || label === "Sain") return C.good;
  if (label === "Moyen" || label === "Tendu") return C.warn;
  if (label === "Fragile" || label === "Critique") return C.bad;
  return C.inkSoft;
}

export function getStyles(C) {
  return {
    app: {
      position: "fixed", inset: 0, color: C.ink,
      // Léger dégradé radial (au lieu d'un aplat uni) pour donner un peu de
      // profondeur au fond de chaque écran, sans toucher au système de
      // cartes/icônes existant.
      background: `radial-gradient(ellipse 120% 60% at 50% -10%, ${C.accent}14, transparent 60%), ${C.bg}`,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      display: "flex", flexDirection: "column", overflow: "hidden",
      paddingTop: "var(--safe-area-inset-top, env(safe-area-inset-top, 0px))",
      paddingBottom: "var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px))",
      paddingLeft: "var(--safe-area-inset-left, env(safe-area-inset-left, 0px))",
      paddingRight: "var(--safe-area-inset-right, env(safe-area-inset-right, 0px))",
      boxSizing: "border-box",
    },
    mono: { fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, monospace", fontVariantNumeric: "tabular-nums" },
    topBar: {
      flexShrink: 0, display: "flex", alignItems: "center", gap: 10,
      padding: "12px 16px 10px", background: C.surfaceRaised, borderBottom: `1px solid ${C.line}`,
    },
    // Colonne centrée pour le contenu lisible, à l'intérieur d'un bandeau
    // plein écran (fond de couleur, bordures) : le bandeau garde sa largeur
    // pleine, seul ce qu'il contient se recentre.
    centerCol: { width: "100%", maxWidth: CONTENT_MAX_WIDTH, margin: "0 auto", boxSizing: "border-box" },
    // Zone de contenu scrollable principale, déjà recentrée — la plupart des
    // écrans l'utilisent directement (pas de fond distinct à préserver).
    content: { flex: 1, overflowY: "auto", width: "100%", maxWidth: CONTENT_MAX_WIDTH, margin: "0 auto", boxSizing: "border-box" },
    backBtn: {
      width: 30, height: 30, borderRadius: RADIUS.sm, background: C.surface, border: `1px solid ${C.line}`,
      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: C.ink, cursor: "pointer", flexShrink: 0,
    },
    card: { background: C.surface, border: `1px solid ${C.line}`, borderRadius: RADIUS.lg, overflow: "hidden", boxShadow: `0 1px 3px ${C.ink}0D` },
    sectionTitle: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: C.inkSoft, fontWeight: 700, margin: "0 0 12px" },
    primaryBtn: {
      background: C.accent, color: C.accentInk, border: "none", borderRadius: RADIUS.md, padding: `${SPACE.md}px ${SPACE.xl}px`,
      fontWeight: 700, fontSize: 14, cursor: "pointer",
    },
    smallBtn: {
      background: C.surface, color: C.ink, border: `1px solid ${C.line}`, borderRadius: RADIUS.md, padding: `${SPACE.sm}px ${SPACE.lg}px`,
      fontSize: 12.5, cursor: "pointer",
    },
    dangerBtn: {
      background: "transparent", color: C.bad, border: `1px solid ${C.bad}`, borderRadius: RADIUS.md, padding: `${SPACE.sm}px ${SPACE.lg}px`,
      fontSize: 12.5, cursor: "pointer",
    },
    formInput: {
      background: C.surface, color: C.ink, border: `1px solid ${C.line}`, borderRadius: RADIUS.sm, padding: `${SPACE.sm}px ${SPACE.md}px`,
      fontSize: 13, fontFamily: "inherit",
    },
    chip: {
      fontSize: 11.5, padding: `${SPACE.xs + 2}px ${SPACE.md}px`, borderRadius: RADIUS.pill, border: `1px solid ${C.line}`, color: C.inkSoft,
      whiteSpace: "nowrap", cursor: "pointer", background: "transparent",
    },
    chipActive: { background: C.accent, color: C.accentInk, border: `1px solid ${C.accent}`, fontWeight: 600 },
    // Bande d'onglets façon navigateur (soulignement sur l'onglet actif,
    // pas de forme "pilule" empilée) — pour les bascules qui changent tout
    // le contenu en dessous (filtres OppMarket, onglets Carrière/Actif),
    // à distinguer des chip de choix multiple (devise, difficulté...) qui
    // gardent le style `chip` en pilule.
    tabBar: { display: "flex", gap: SPACE.md, borderBottom: `1px solid ${C.line}` },
    tab: {
      flex: "0 0 auto", padding: `${SPACE.sm}px ${SPACE.xs}px`, fontSize: 12.5, fontWeight: 600,
      color: C.inkSoft, background: "transparent", border: "none", borderBottom: "2px solid transparent",
      cursor: "pointer", whiteSpace: "nowrap", marginBottom: -1,
    },
    tabActive: { color: C.ink, borderBottom: `2px solid ${C.accent}` },
    placeholderImg: {
      background: C.placeholderBg, border: `1px dashed ${C.placeholderLine}`,
      display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
    },
    placeholderFile: {
      fontFamily: "ui-monospace, monospace", fontSize: 10, color: C.inkSoft, background: C.surface,
      padding: `${SPACE.xs}px ${SPACE.sm}px`, borderRadius: RADIUS.xs, border: `1px solid ${C.line}`,
    },
  };
}
