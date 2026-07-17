import CurrencyPicker from "./screens/CurrencyPicker.jsx";
import { styles, COLORS, DISPLAY_FONT } from "../styles/theme.js";

export default function Header({ profession, phase, onMenu, onTrading, onCasino, onRules, bourseEnabled, casinoEnabled, isDesktop, currency, onCycleCurrency }) {
  return (
    <div style={{ ...styles.header, flexDirection: isDesktop ? "row" : "column", alignItems: isDesktop ? "center" : "stretch", gap: isDesktop ? 0 : 8 }}>
      <div>
        <div style={{ fontSize: 9, letterSpacing: 2, color: COLORS.inkSoft, textTransform: "uppercase" }}>Passeport — {phase === "fasttrack" ? "Voie rapide" : "Course infernale"}</div>
        <div style={{ fontFamily: DISPLAY_FONT, fontSize: isDesktop ? 19 : 16, color: COLORS.ink, fontWeight: 700 }}>
          {profession?.icon} {profession?.name}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: isDesktop ? "flex-end" : "flex-start" }}>
        <CurrencyPicker currency={currency} onCycle={onCycleCurrency} compact />
        {bourseEnabled && <button className="btn-small" style={{ ...styles.smallBtn, whiteSpace: "nowrap" }} onClick={onTrading}>📈 Bourse</button>}
        {casinoEnabled && <button className="btn-small" style={{ ...styles.smallBtn, whiteSpace: "nowrap" }} onClick={onCasino}>🎰 Casino</button>}
        <button className="btn-small" style={{ ...styles.smallBtn, whiteSpace: "nowrap" }} onClick={onRules}>📖 Règles</button>
        <button className="btn-small" style={{ ...styles.smallBtn, whiteSpace: "nowrap" }} onClick={onMenu}>Menu</button>
      </div>
    </div>
  );
}
