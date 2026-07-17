export const COLORS = {
  paper: "#F3E8D2",
  paperDark: "#E8D8BB",
  card: "#FFF9ED",
  ink: "#17202A",
  inkSoft: "#5E6871",
  rust: "#B94125",
  teal: "#3F6E5D",
  mustard: "#CD8E2A",
  navy: "#33495E",
  plum: "#6B4E71",
  rose: "#A85B71",
  charcoal: "#2E3236",
};

export const DISPLAY_FONT = "'Fraunces', Georgia, 'Times New Roman', serif";

export const styles = {
  app: { position: "fixed", inset: 0, background: COLORS.paper, backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 26px, rgba(35,42,49,0.05) 27px)`, fontFamily: "'Helvetica Neue', Arial, sans-serif", display: "flex", flexDirection: "column", overflow: "hidden", paddingTop: "var(--safe-area-inset-top, env(safe-area-inset-top, 0px))", paddingBottom: "var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px))", paddingLeft: "var(--safe-area-inset-left, env(safe-area-inset-left, 0px))", paddingRight: "var(--safe-area-inset-right, env(safe-area-inset-right, 0px))", boxSizing: "border-box" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px dashed ${COLORS.inkSoft}`, flexShrink: 0, background: COLORS.paperDark },
  main: { display: "flex", flex: 1, overflow: "auto", padding: 12, gap: 14 },
  boardCol: { display: "flex", flexDirection: "column", alignItems: "center", flex: 1, minWidth: 0 },
  ledgerCol: { flexShrink: 0, width: "100%" },
  boardWrap: { display: "flex", flexDirection: "column", alignItems: "center", background: COLORS.paperDark, borderRadius: 10, padding: 14, border: `1px solid ${COLORS.inkSoft}` },
  ring: { display: "grid", gap: 4 },
  cell: { display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4, position: "relative", boxSizing: "border-box" },
  stampBadge: { position: "absolute", top: -9, right: -10, background: COLORS.ink, color: COLORS.card, fontSize: 8, fontWeight: 700, letterSpacing: 0.5, padding: "2px 5px", borderRadius: 3, transform: "rotate(-8deg)", boxShadow: "1px 1px 0 rgba(0,0,0,0.25)" },
  die: { width: 46, height: 46, borderRadius: 6, background: COLORS.card, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${COLORS.ink}`, boxShadow: "2px 2px 0 rgba(35,42,49,0.2)" },
  diePipGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "repeat(3, 1fr)", width: 30, height: 30, gap: 2 },
  pip: { width: "100%", height: "100%", borderRadius: "50%", background: COLORS.ink, alignSelf: "center", justifySelf: "center", transform: "scale(0.62)" },
  primaryBtn: { background: COLORS.mustard, color: COLORS.ink, border: `2px solid ${COLORS.ink}`, borderRadius: 6, padding: "11px 22px", fontWeight: 700, fontSize: 13, cursor: "pointer", textTransform: "uppercase", letterSpacing: 0.5, boxShadow: "3px 3px 0 rgba(35,42,49,0.25)" },
  smallBtn: { background: COLORS.card, color: COLORS.ink, border: `1.5px dashed ${COLORS.inkSoft}`, borderRadius: 6, padding: "8px 12px", fontSize: 11, cursor: "pointer", textTransform: "uppercase", letterSpacing: 0.4 },
  smallBtnDanger: { background: COLORS.rust, color: COLORS.card, border: `1.5px solid ${COLORS.ink}`, borderRadius: 6, padding: "8px 12px", fontSize: 11, cursor: "pointer", textTransform: "uppercase", letterSpacing: 0.4 },
  banner: { marginTop: 12, background: COLORS.card, border: "1.5px dashed", borderRadius: 8, padding: "10px 14px", width: "100%", maxWidth: 380, boxSizing: "border-box" },
  ledger: { background: COLORS.card, borderRadius: 10, padding: 16, border: `1px solid ${COLORS.inkSoft}` },
  ledgerTitle: { fontFamily: DISPLAY_FONT, fontSize: 15, color: COLORS.ink, marginBottom: 8, borderBottom: `2px solid ${COLORS.mustard}`, paddingBottom: 6, letterSpacing: 0.2, fontWeight: 700, display: "inline-block" },
  ledgerRow: { display: "flex", justifyContent: "space-between", fontSize: 13, padding: "3px 0" },
  ledgerDivider: { height: 0, borderTop: `1px dashed ${COLORS.inkSoft}`, margin: "6px 0" },
  exitBar: { marginTop: 14, background: COLORS.paper, borderRadius: 8, padding: 10, border: `1px dashed ${COLORS.inkSoft}` },
  exitTrack: { height: 8, borderRadius: 5, background: "rgba(35,42,49,0.1)", overflow: "hidden" },
  exitFill: { height: "100%", background: COLORS.teal, transition: "width 0.4s" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(35,42,49,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 },
  modalCard: { background: COLORS.card, border: `2px solid ${COLORS.ink}`, borderRadius: 10, padding: 20, width: "100%", maxWidth: 360, maxHeight: "85vh", overflowY: "auto", boxShadow: "6px 6px 0 rgba(35,42,49,0.2)" },
  profGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, maxWidth: 720, width: "100%", margin: "0 auto", boxSizing: "border-box" },
  profCard: { background: COLORS.card, border: `1.5px dashed ${COLORS.inkSoft}`, borderRadius: 8, padding: 14, cursor: "pointer", textAlign: "center", color: COLORS.ink, width: "100%", minWidth: 0, boxSizing: "border-box" },
  deleteBadge: { position: "absolute", top: -6, right: -6, width: 22, height: 22, borderRadius: "50%", background: COLORS.rust, color: COLORS.card, border: `1.5px solid ${COLORS.ink}`, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 },
  formLabel: { display: "block", fontSize: 11, color: COLORS.inkSoft, marginTop: 12, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 },
  formInput: { width: "100%", boxSizing: "border-box", background: COLORS.card, border: `1.5px dashed ${COLORS.inkSoft}`, borderRadius: 6, padding: "9px 10px", fontSize: 14, color: COLORS.ink, fontFamily: "inherit" },
  formInputSmall: { width: 90, boxSizing: "border-box", background: COLORS.card, border: `1.5px dashed ${COLORS.inkSoft}`, borderRadius: 6, padding: "6px 8px", fontSize: 12, color: COLORS.ink, fontFamily: "'Courier New', monospace" },
  expenseRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "6px 0", borderBottom: `1px dashed ${COLORS.paperDark}` },
  tokenCard: { background: COLORS.paper, border: `1.5px dashed ${COLORS.inkSoft}`, borderRadius: 8, padding: 10 },
  tokenListItem: { display: "flex", justifyContent: "space-between", alignItems: "center", background: COLORS.card, border: `1.5px dashed ${COLORS.inkSoft}`, borderRadius: 8, padding: "8px 10px", cursor: "pointer", textTransform: "none", letterSpacing: 0 },
  journalItem: { background: COLORS.paper, border: `1px dashed ${COLORS.inkSoft}`, borderRadius: 6, padding: "8px 10px", width: "100%", boxSizing: "border-box", cursor: "pointer" },
  dreamBtn: { display: "flex", alignItems: "center", background: COLORS.paper, border: `1.5px dashed ${COLORS.inkSoft}`, borderRadius: 8, padding: "10px 12px", color: COLORS.ink, cursor: "pointer", fontSize: 13 },
  sectionLabel: { color: COLORS.inkSoft, fontFamily: DISPLAY_FONT, fontSize: 14, marginBottom: 10, textAlign: "center", letterSpacing: 0.5, fontWeight: 700 },
  currencyChip: { background: COLORS.card, border: `1.5px dashed ${COLORS.inkSoft}`, borderRadius: 20, padding: "7px 13px", fontSize: 12, color: COLORS.ink, cursor: "pointer" },
  currencyChipActive: { border: `1.5px solid ${COLORS.ink}`, background: COLORS.mustard },
  currencyBadge: { width: 30, height: 30, borderRadius: "50%", border: `1.5px dashed ${COLORS.ink}`, background: COLORS.card, color: COLORS.ink, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  currencyBadgeLarge: { width: 46, height: 46, borderRadius: "50%", border: `2px dashed ${COLORS.ink}`, background: COLORS.card, color: COLORS.ink, fontSize: 14, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  menuSaveCard: { background: COLORS.card, border: `1.5px dashed ${COLORS.inkSoft}`, borderRadius: 8, padding: "10px 14px", marginBottom: 4 },
  bigStamp: { fontFamily: DISPLAY_FONT, fontSize: 28, fontWeight: 700, color: COLORS.teal, border: `3px double ${COLORS.teal}`, borderRadius: 8, padding: "10px 22px", transform: "rotate(-4deg)", letterSpacing: 1 },
  menuCover: { position: "relative", background: COLORS.card, border: `1.5px solid ${COLORS.ink}`, borderRadius: 14, padding: "34px 26px 26px", boxShadow: "5px 5px 0 rgba(35,42,49,0.18)", overflow: "hidden" },
  menuWatermark: { position: "absolute", top: 10, right: -18, fontSize: 90, color: COLORS.ink, pointerEvents: "none", userSelect: "none" },
  menuBtnIcon: { marginRight: 8 },
};

export const CSS_EXTRA = `
  /* Hallmark · macrostructure: Long Document · genre: editorial · theme: studied-DNA */
  * { -webkit-tap-highlight-color: transparent; }
  button { font-family: inherit; white-space: nowrap; }
  .classic-display { font-family: ${DISPLAY_FONT}; font-weight: 700; }
  .btn-primary:active { transform: translate(3px, 3px); box-shadow: none !important; }
  .btn-small:hover, .prof-card:hover, .dream-btn:hover, .chip-btn:hover { border-style: solid; }
  .prof-card:active, .chip-btn:active, .stamp-btn:active { transform: scale(0.96); }
  .prof-card, .dream-btn, .chip-btn, .btn-small, .btn-primary { transition: transform 0.12s, border-style 0.12s, box-shadow 0.12s; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-thumb { background: ${COLORS.inkSoft}; border-radius: 3px; }

  @keyframes stampPop {
    0% { transform: scale(0.3) rotate(-18deg); opacity: 0; }
    55% { transform: scale(1.2) rotate(6deg); opacity: 1; }
    100% { transform: scale(1) rotate(-8deg); opacity: 1; }
  }
  .stamp-pop { animation: stampPop 0.35s cubic-bezier(.34,1.56,.64,1); }

  @keyframes cellHop {
    0% { transform: scale(1) translateY(0); }
    40% { transform: scale(1.35) translateY(-3px); }
    100% { transform: scale(1) translateY(0); }
  }
  .cell-hop { animation: cellHop 0.17s ease-out; display: inline-block; }

  @keyframes diceRoll {
    0% { transform: rotate(0deg) scale(1); }
    25% { transform: rotate(95deg) scale(1.08); }
    50% { transform: rotate(180deg) scale(0.95); }
    75% { transform: rotate(270deg) scale(1.08); }
    100% { transform: rotate(360deg) scale(1); }
  }
  .dice-rolling { animation: diceRoll 0.4s linear infinite; }

  @keyframes bannerIn {
    from { opacity: 0; transform: translateY(8px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  .banner-in { animation: bannerIn 0.28s ease-out; }

  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.9) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
  .modal-in { animation: modalIn 0.22s cubic-bezier(.34,1.56,.64,1); }

  @keyframes overlayIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .modal-overlay-in { animation: overlayIn 0.18s ease-out; }

  @keyframes screenIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .screen-in { animation: screenIn 0.32s cubic-bezier(.22,1,.36,1); }

  @keyframes menuItemIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .menu-stagger > * { animation: menuItemIn 0.32s cubic-bezier(.22,1,.36,1) both; }
  .menu-stagger > *:nth-child(1) { animation-delay: 0.03s; }
  .menu-stagger > *:nth-child(2) { animation-delay: 0.08s; }
  .menu-stagger > *:nth-child(3) { animation-delay: 0.13s; }
  .menu-stagger > *:nth-child(4) { animation-delay: 0.18s; }
  .menu-stagger > *:nth-child(5) { animation-delay: 0.23s; }
  .menu-stagger > *:nth-child(6) { animation-delay: 0.28s; }

  @keyframes stampWatermarkIn {
    0% { opacity: 0; transform: rotate(-14deg) scale(0.85); }
    100% { opacity: 0.16; transform: rotate(-10deg) scale(1); }
  }
  .menu-watermark { animation: stampWatermarkIn 0.6s cubic-bezier(.22,1,.36,1) both; }

  @media (prefers-reduced-motion: reduce) {
    .stamp-pop, .cell-hop, .dice-rolling, .banner-in, .modal-in, .modal-overlay-in, .screen-in, .menu-stagger > *, .menu-watermark { animation: none !important; }
  }
`;
