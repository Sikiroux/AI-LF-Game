import { fmt } from "../../utils/format.js";
import Row from "../ledger/Row.jsx";
import { styles, COLORS } from "../../styles/theme.js";

export default function EndGameStats({ turnCount, profession, assets, passiveIncome, tokens, portfolio, casinoHandsPlayed, casinoNetResult, bankLoanBalance, currency }) {
  const f = (n) => fmt(n, currency);
  const portfolioValue = tokens.reduce((s, t) => s + ((portfolio[t.symbol]?.shares) || 0) * t.price, 0);
  const ownedStocks = Object.values(portfolio).reduce((s, p) => s + (p.shares || 0), 0);

  return (
    <div style={{ ...styles.ledger, width: "100%", maxWidth: 360, textAlign: "left", marginTop: 20 }}>
      <div style={styles.ledgerTitle}>Statistiques de la partie</div>
      <Row label="Tours joués" value={turnCount} bold />
      {profession && <Row label="Métier" value={`${profession.icon} ${profession.name}`} />}
      <Row label="Actifs détenus en fin de partie" value={assets.length} />
      {assets.length > 0 && <Row label="Revenu passif généré" value={`${f(passiveIncome)}/mois`} />}
      {ownedStocks > 0 && (
        <>
          <Row label="Actions détenues" value={ownedStocks} />
          <Row label="Valeur du portefeuille boursier" value={f(portfolioValue)} />
        </>
      )}
      {casinoHandsPlayed > 0 && (
        <Row label={`Casino (${casinoHandsPlayed} main${casinoHandsPlayed > 1 ? "s" : ""})`} value={`${casinoNetResult >= 0 ? "+" : ""}${f(casinoNetResult)}`} negative={casinoNetResult < 0} />
      )}
      {bankLoanBalance > 0 && <Row label="Prêt bancaire restant dû" value={f(bankLoanBalance)} negative />}
    </div>
  );
}
