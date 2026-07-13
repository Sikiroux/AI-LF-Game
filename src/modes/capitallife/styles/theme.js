import { useState, useEffect } from "react";

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
export function getStyles(C) {
  return {
    app: {
      position: "fixed", inset: 0, background: C.bg, color: C.ink,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      display: "flex", flexDirection: "column", overflow: "hidden",
    },
    mono: { fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, monospace", fontVariantNumeric: "tabular-nums" },
    topBar: {
      flexShrink: 0, display: "flex", alignItems: "center", gap: 10,
      padding: "12px 16px 10px", background: C.surfaceRaised, borderBottom: `1px solid ${C.line}`,
    },
    backBtn: {
      width: 30, height: 30, borderRadius: 9, background: C.surface, border: `1px solid ${C.line}`,
      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: C.ink, cursor: "pointer", flexShrink: 0,
    },
    card: { background: C.surface, border: `1px solid ${C.line}`, borderRadius: 16, overflow: "hidden" },
    sectionTitle: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: C.inkSoft, fontWeight: 700, margin: "0 0 12px" },
    primaryBtn: {
      background: C.accent, color: C.accentInk, border: "none", borderRadius: 12, padding: "13px 22px",
      fontWeight: 700, fontSize: 14, cursor: "pointer",
    },
    smallBtn: {
      background: C.surface, color: C.ink, border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 14px",
      fontSize: 12.5, cursor: "pointer",
    },
    chip: {
      fontSize: 11.5, padding: "6px 12px", borderRadius: 999, border: `1px solid ${C.line}`, color: C.inkSoft,
      whiteSpace: "nowrap", cursor: "pointer", background: "transparent",
    },
    chipActive: { background: C.accent, color: C.accentInk, border: `1px solid ${C.accent}`, fontWeight: 600 },
    placeholderImg: {
      background: C.placeholderBg, border: `1.5px dashed ${C.placeholderLine}`,
      display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
    },
    placeholderFile: {
      fontFamily: "ui-monospace, monospace", fontSize: 10, color: C.inkSoft, background: C.surface,
      padding: "3px 8px", borderRadius: 6, border: `1px solid ${C.line}`,
    },
  };
}
