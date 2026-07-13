import { styles, COLORS, CSS_EXTRA } from "../../styles/theme.js";
import EndGameStats from "./EndGameStats.jsx";

export default function BankruptScreen({ turnCount, onReset, profession, assets, passiveIncome, tokens, portfolio, casinoHandsPlayed, casinoNetResult, bankLoanBalance, currency }) {
  return (
    <div className="screen-in" style={{ ...styles.app, overflowY: "auto", alignItems: "center", justifyContent: "flex-start", display: "flex", flexDirection: "column", textAlign: "center", padding: 24 }}>
      <style>{CSS_EXTRA}</style>
      <div style={{ ...styles.bigStamp, color: COLORS.rust, borderColor: COLORS.rust }}>FAILLITE</div>
      <div style={{ fontSize: 46, marginTop: 14 }}>📉</div>
      <div style={{ fontFamily: "Georgia, serif", fontSize: 24, color: COLORS.ink, marginTop: 8, fontWeight: 700 }}>Vous êtes éliminé·e</div>
      <div style={{ color: COLORS.inkSoft, marginTop: 8, maxWidth: 340 }}>
        Même en revendant tous vos actifs, vous n'avez pas pu couvrir vos dettes. La partie s'arrête ici.
      </div>
      <div style={{ color: COLORS.inkSoft, fontSize: 13, marginTop: 6 }}>Tenu {turnCount} tours.</div>
      <EndGameStats turnCount={turnCount} profession={profession} assets={assets} passiveIncome={passiveIncome} tokens={tokens} portfolio={portfolio} casinoHandsPlayed={casinoHandsPlayed} casinoNetResult={casinoNetResult} bankLoanBalance={bankLoanBalance} currency={currency} />
      <button className="btn-primary" style={{ ...styles.primaryBtn, marginTop: 24, marginBottom: 24 }} onClick={onReset}>Nouvelle partie</button>
    </div>
  );
}
