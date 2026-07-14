import Row from "./Row.jsx";
import { fmt } from "../../utils/format.js";
import { BANK_LOAN_RATE, LIABILITY_KEYS, LIABILITY_LABELS } from "../../engine/financing.js";
import { COLORS, styles } from "../../styles/theme.js";

export default function Ledger({ profession, cash, kids, assets, liabilities, extraDebtBalance, extraMonthly, bankLoanBalance, onTakeBankLoan, onRepayBankLoan, passiveIncome, totalExpenses, totalIncome, netCashflow, currency, tokens, portfolio, onOpenAssets, onOpenDebts }) {
  const e = profession.expenses;
  const f = (n) => fmt(n, currency);
  const bankLoanMonthly = Math.round(bankLoanBalance * BANK_LOAN_RATE);
  const portfolioValue = tokens.reduce((s, t) => s + ((portfolio[t.symbol]?.shares) || 0) * t.price, 0);
  const liabilitiesDue = LIABILITY_KEYS.reduce((s, key) => s + (liabilities[key] > 0 ? liabilities[key] : 0), 0);
  return (
    <div style={styles.ledger}>
      <div style={styles.ledgerTitle}>Compte de résultat</div>
      <Row label="Salaire" value={f(profession.salary)} />
      <Row label="Revenus passifs" value={f(passiveIncome)} />
      <Row label="Revenu total" value={f(totalIncome)} bold />
      <div style={styles.ledgerDivider} />
      {e.taxes > 0 && <Row label="Impôts" value={f(e.taxes)} negative />}
      {LIABILITY_KEYS.map((key) => (liabilities[key] > 0) && (
        <Row key={key} label={LIABILITY_LABELS[key]} value={f(e[key])} negative />
      ))}
      {e.other > 0 && <Row label="Autres dépenses" value={f(e.other)} negative />}
      {kids > 0 && <Row label={`Enfants (${kids})`} value={f(kids * profession.perChild)} negative />}
      {extraMonthly > 0 && <Row label="Dette imprévue" value={f(extraMonthly)} negative />}
      {bankLoanMonthly > 0 && <Row label="Prêt bancaire" value={f(bankLoanMonthly)} negative />}
      <Row label="Dépenses totales" value={f(totalExpenses)} bold negative />
      <div style={styles.ledgerDivider} />
      <Row label="Cashflow mensuel" value={f(netCashflow)} bold negative={netCashflow < 0} />

      <div style={{ ...styles.ledgerTitle, marginTop: 16 }}>Bilan</div>
      <Row label="Liquidités" value={f(cash)} bold />
      <button className="btn-small" style={{ ...styles.smallBtn, width: "100%", boxSizing: "border-box", marginTop: 6, marginBottom: 6 }} onClick={onOpenAssets}>
        📁 Mes actifs ({assets.length}){assets.some((a) => a.loanBalance > 0) ? ` — ${f(assets.reduce((s, a) => s + (a.loanBalance || 0), 0))} dû` : ""}
      </button>
      <button className="btn-small" style={{ ...styles.smallBtn, width: "100%", boxSizing: "border-box", marginBottom: 6 }} onClick={onOpenDebts}>
        💳 Mes dettes{liabilitiesDue > 0 ? ` — ${f(liabilitiesDue)} dû` : ""}
      </button>
      {portfolioValue > 0 && <Row label="Portefeuille boursier" value={f(portfolioValue)} bold />}
      {extraDebtBalance > 0 && <Row label="Dette imprévue (solde)" value={f(extraDebtBalance)} negative />}

      <div style={styles.exitBar}>
        <div style={{ fontSize: 11, color: COLORS.inkSoft, marginBottom: 6 }}>Prêt bancaire — 10%/mois, remboursable par tranches de 1000</div>
        <Row label="Solde emprunté" value={f(bankLoanBalance)} bold negative={bankLoanBalance > 0} />
        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
          <button className="btn-small" style={{ ...styles.smallBtn, flex: 1 }} onClick={() => onTakeBankLoan(1)}>Emprunter {f(1000)}</button>
          <button className="btn-small" style={{ ...styles.smallBtn, flex: 1, opacity: bankLoanBalance >= 1000 && cash >= 1000 ? 1 : 0.4 }} disabled={bankLoanBalance < 1000 || cash < 1000} onClick={() => onRepayBankLoan(1)}>Rembourser {f(1000)}</button>
        </div>
      </div>

      <div style={styles.exitBar}>
        <div style={{ fontSize: 11, color: COLORS.inkSoft, marginBottom: 4 }}>
          Revenus passifs vs dépenses — sortie de la course infernale
        </div>
        <div style={styles.exitTrack}>
          <div style={{ ...styles.exitFill, width: `${Math.min(100, (passiveIncome / Math.max(1,totalExpenses)) * 100)}%` }} />
        </div>
        <div style={{ fontSize: 11, color: COLORS.ink, marginTop: 3, fontFamily: "'Courier New', monospace" }}>{f(passiveIncome)} / {f(totalExpenses)}</div>
      </div>
    </div>
  );
}
