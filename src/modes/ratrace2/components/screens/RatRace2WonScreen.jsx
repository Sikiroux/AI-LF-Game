import { fmt } from "../../../../utils/format.js";
import { styles, COLORS, CSS_EXTRA } from "../../../../styles/theme.js";
import EndGameStats from "../../../../components/screens/EndGameStats.jsx";

export default function RatRace2WonScreen({ day, profession, assets, passiveIncome, tokens, portfolio, casinoHandsPlayed, casinoNetResult, debts, currency, onReset }) {
  const month = Math.floor((day - 1) / 30) + 1;
  const debtRemaining = debts.reduce((s, d) => s + d.balance, 0);
  return (
    <div className="screen-in" style={{ ...styles.app, overflowY: "auto", alignItems: "center", justifyContent: "flex-start", display: "flex", flexDirection: "column", textAlign: "center", padding: 24 }}>
      <style>{CSS_EXTRA}</style>
      <div style={styles.bigStamp}>LIBERTÉ</div>
      <div style={{ fontSize: 46, marginTop: 14 }}>🏆</div>
      <div style={{ fontFamily: "Georgia, serif", fontSize: 24, color: COLORS.ink, marginTop: 8, fontWeight: 700 }}>Vous êtes sorti·e de la course infernale !</div>
      <div style={{ color: COLORS.inkSoft, marginTop: 8, maxWidth: 340 }}>
        Vos revenus passifs (<b style={{ color: COLORS.ink }}>{fmt(passiveIncome, currency)}</b>/mois) dépassent désormais vos dépenses. Vous n'avez plus besoin de votre salaire pour vivre.
      </div>
      <div style={{ color: COLORS.inkSoft, fontSize: 13, marginTop: 6 }}>Atteint en {month} mois ({day} jours).</div>
      <EndGameStats turnCount={day} profession={profession} assets={assets} passiveIncome={passiveIncome} tokens={tokens} portfolio={portfolio} casinoHandsPlayed={casinoHandsPlayed} casinoNetResult={casinoNetResult} bankLoanBalance={debtRemaining} currency={currency} />
      <button className="btn-primary" style={{ ...styles.primaryBtn, marginTop: 24, marginBottom: 24 }} onClick={onReset}>Nouvelle situation</button>
    </div>
  );
}
