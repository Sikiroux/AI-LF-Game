import { useState } from "react";
import { fmt } from "../../utils/format.js";
import ModalShell from "./ModalShell.jsx";
import Row from "../ledger/Row.jsx";
import { computeFinancing, getYieldMultiplier, amortizedPayment, maxAmortMonths, MAX_DEBT_RATIO, BANK_LOAN_RATE } from "../../engine/financing.js";
import { SECTOR_LABELS } from "../../data/sectors.js";
import { styles, COLORS } from "../../styles/theme.js";

export default function DecisionModal({ decision, cash, fastCash, currency, downPaymentPct, financingMode, yieldMode, customYieldMultiplier, loanRateMult, debtRatioEnabled, currentDebtPayments, totalIncome, onBuy, onSkip, onMarket, onCharity, onBuyFast, onSkipFast, onCharityFast, onDoodadCash, onDoodadFinance }) {
  const f = (n) => fmt(n, currency);
  const [amortMonths, setAmortMonths] = useState(120);
  const [showAmortOption, setShowAmortOption] = useState(false);
  if (decision.kind === "fastbusiness") {
    const card = decision.card;
    const afford = fastCash >= card.cost;
    return (
      <ModalShell>
        <div style={{ fontSize: 10, color: COLORS.navy, textTransform: "uppercase", letterSpacing: 2, fontWeight: 700 }}>Business — Voie rapide</div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 18, color: COLORS.ink, marginTop: 4, fontWeight: 700 }}>{card.title}</div>
        <div style={{ color: COLORS.inkSoft, fontSize: 13, marginTop: 6 }}>{card.desc}</div>
        <div style={styles.ledgerDivider} />
        <Row label="Vos liquidités" value={f(fastCash)} />
        <Row label="Coût" value={f(card.cost)} />
        <Row label="Revenu supplémentaire" value={`+${f(card.incomeGain)}/tour`} bold />
        {!afford && <div style={{ color: COLORS.rust, fontSize: 12, marginTop: 6 }}>Liquidités insuffisantes.</div>}
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button className="btn-primary" style={{ ...styles.primaryBtn, flex: 1, opacity: afford ? 1 : 0.4 }} disabled={!afford} onClick={() => onBuyFast(card)}>Acheter</button>
          <button className="btn-small" style={{ ...styles.smallBtn, flex: 1 }} onClick={() => onSkipFast(card)}>Ignorer</button>
        </div>
      </ModalShell>
    );
  }
  if (decision.kind === "fastcharity") {
    return (
      <ModalShell>
        <div style={{ fontSize: 10, color: COLORS.plum, textTransform: "uppercase", letterSpacing: 2, fontWeight: 700 }}>Don</div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 18, color: COLORS.ink, marginTop: 4, fontWeight: 700 }}>Faire un don ?</div>
        <div style={{ color: COLORS.inkSoft, fontSize: 13, marginTop: 6 }}>Donnez 10% de votre revenu voie rapide pour lancer 3 dés pendant 3 tours.</div>
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button className="btn-primary" style={{ ...styles.primaryBtn, flex: 1 }} onClick={() => onCharityFast(true)}>Donner</button>
          <button className="btn-small" style={{ ...styles.smallBtn, flex: 1 }} onClick={() => onCharityFast(false)}>Refuser</button>
        </div>
      </ModalShell>
    );
  }
  if (decision.kind === "opportunity") {
    const card = decision.card;
    const financeable = card.type !== "stock";
    const yieldMult = getYieldMultiplier(yieldMode, customYieldMultiplier);
    const grossCashflow = Math.round(card.cashflow * yieldMult);
    const cashFin = { downPayment: card.cost, loanAmount: 0, loanMonthly: 0, netCashflow: grossCashflow };
    const loanFin = financeable ? computeFinancing(card, financingMode, downPaymentPct, loanRateMult, yieldMode, customYieldMultiplier) : null;
    const affordCash = cash >= cashFin.downPayment;
    const projectedRatio = loanFin && totalIncome > 0 ? (currentDebtPayments + loanFin.loanMonthly) / totalIncome : 0;
    const ratioBlocked = financeable && debtRatioEnabled && projectedRatio > MAX_DEBT_RATIO;
    const affordLoan = loanFin && cash >= loanFin.downPayment && !ratioBlocked;
    const apportLabel = financingMode === "realistic" ? "Apport personnel (fixé par l'affaire)" : `Apport personnel (${downPaymentPct}%)`;
    return (
      <ModalShell>
        {card.jackpot ? (
          <div style={{ fontSize: 10, color: COLORS.mustard, textTransform: "uppercase", letterSpacing: 2, fontWeight: 700 }}>🌟 Affaire exceptionnelle — {SECTOR_LABELS[card.sector] || ""}</div>
        ) : (
          <div style={{ fontSize: 10, color: COLORS.navy, textTransform: "uppercase", letterSpacing: 2, fontWeight: 700 }}>Opportunité — {SECTOR_LABELS[card.sector] || ""}</div>
        )}
        <div style={{ fontFamily: "Georgia, serif", fontSize: 18, color: card.jackpot ? COLORS.mustard : COLORS.ink, marginTop: 4, fontWeight: 700 }}>{card.title}</div>
        <div style={{ color: COLORS.inkSoft, fontSize: 13, marginTop: 6 }}>{card.desc}</div>
        {yieldMult !== 1 && <div style={{ fontSize: 11, color: COLORS.teal, marginTop: 4, fontStyle: "italic" }}>Mode de rendement : ×{yieldMult} sur le revenu de base.</div>}
        {loanRateMult !== 1 && <div style={{ fontSize: 11, color: loanRateMult > 1 ? COLORS.rust : COLORS.teal, marginTop: 4, fontStyle: "italic" }}>Conjoncture économique : taux d'emprunt {loanRateMult > 1 ? "majoré" : "réduit"} en ce moment.</div>}
        {card.note && <div style={{ fontSize: 11, color: COLORS.mustard, marginTop: 4, fontStyle: "italic" }}>{card.note}</div>}
        <div style={styles.ledgerDivider} />
        <Row label="Vos liquidités" value={f(cash)} />
        <Row label="Prix total" value={f(card.cost)} bold />

        <div style={{ fontSize: 11, color: COLORS.inkSoft, marginTop: 10, marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>Option comptant</div>
        <Row label="À payer" value={f(cashFin.downPayment)} />
        <Row label="Revenu passif" value={`+${f(cashFin.netCashflow)}/mois`} bold />
        <button className="btn-primary" style={{ ...styles.primaryBtn, width: "100%", boxSizing: "border-box", marginTop: 6, opacity: affordCash ? 1 : 0.4 }} disabled={!affordCash} onClick={() => onBuy(card, false)}>Payer comptant</button>
        {!affordCash && <div style={{ color: COLORS.rust, fontSize: 11, marginTop: 4 }}>Liquidités insuffisantes.</div>}

        {financeable && (
          <>
            <div style={{ fontSize: 11, color: COLORS.inkSoft, marginTop: 14, marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>Option apport + financement</div>
            <Row label={apportLabel} value={f(loanFin.downPayment)} />
            <Row label="Solde dû" value={f(loanFin.loanAmount)} negative />
            <Row label="Mensualité (intérêts seuls)" value={`-${f(loanFin.loanMonthly)}/mois`} negative />
            <Row label="Revenu passif net" value={`+${f(loanFin.netCashflow)}/mois`} bold negative={loanFin.netCashflow < 0} />
            <div style={{ fontSize: 10, color: COLORS.inkSoft, marginTop: 4, fontStyle: "italic" }}>
              Comme dans le vrai jeu, ce solde ne diminue pas tout seul. Une fois acheté, vous pourrez le rembourser d'un coup ou passer en mensualités classiques depuis "Mes actifs".
            </div>
            {debtRatioEnabled && <Row label="Taux d'endettement après achat" value={`${Math.round(projectedRatio * 100)}% (max ${Math.round(MAX_DEBT_RATIO * 100)}%)`} negative={ratioBlocked} />}
            <button className="btn-primary" style={{ ...styles.primaryBtn, width: "100%", boxSizing: "border-box", marginTop: 6, opacity: affordLoan ? 1 : 0.4 }} disabled={!affordLoan} onClick={() => onBuy(card, true)}>Acheter avec financement</button>
            {!affordLoan && !ratioBlocked && <div style={{ color: COLORS.rust, fontSize: 11, marginTop: 4 }}>Apport insuffisant.</div>}
            {ratioBlocked && <div style={{ color: COLORS.rust, fontSize: 11, marginTop: 4 }}>Refusé par la banque : taux d'endettement trop élevé.</div>}

            <button className="btn-small" style={{ ...styles.smallBtn, width: "100%", boxSizing: "border-box", marginTop: 10 }} onClick={() => setShowAmortOption((v) => !v)}>
              {showAmortOption ? "Masquer" : "Option avancée : mensualités classiques (capital + intérêts)"}
            </button>
            {showAmortOption && (() => {
              const maxMonths = maxAmortMonths(card.type);
              const clampedMonths = Math.min(amortMonths, maxMonths);
              const amortPayment = Math.round(amortizedPayment(loanFin.loanAmount, loanFin.annualRate, clampedMonths / 12));
              const amortNet = loanFin.grossCashflow - amortPayment;
              const amortRatio = totalIncome > 0 ? (currentDebtPayments + amortPayment) / totalIncome : 0;
              const amortBlocked = debtRatioEnabled && amortRatio > MAX_DEBT_RATIO;
              const amortAfford = cash >= loanFin.downPayment && !amortBlocked;
              return (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input type="range" min={12} max={maxMonths} step={6} value={clampedMonths} onChange={(e) => setAmortMonths(Number(e.target.value))} style={{ flex: 1 }} />
                    <div style={{ fontFamily: "'Courier New', monospace", fontWeight: 700, color: COLORS.ink, width: 60, textAlign: "right" }}>{clampedMonths} mois</div>
                  </div>
                  <Row label="Mensualité (capital + intérêts)" value={`-${f(amortPayment)}/mois`} negative />
                  <Row label="Revenu passif net" value={`+${f(amortNet)}/mois`} bold negative={amortNet < 0} />
                  {debtRatioEnabled && <Row label="Taux d'endettement après achat" value={`${Math.round(amortRatio * 100)}% (max ${Math.round(MAX_DEBT_RATIO * 100)}%)`} negative={amortBlocked} />}
                  <div style={{ fontSize: 10, color: COLORS.inkSoft, marginTop: 4, fontStyle: "italic" }}>Le solde baisse réellement à chaque paie jusqu'à être remboursé après {clampedMonths} mois.</div>
                  <button className="btn-primary" style={{ ...styles.primaryBtn, width: "100%", boxSizing: "border-box", marginTop: 6, opacity: amortAfford ? 1 : 0.4 }} disabled={!amortAfford} onClick={() => onBuy(card, clampedMonths)}>Acheter avec mensualités classiques</button>
                  {amortBlocked && <div style={{ color: COLORS.rust, fontSize: 11, marginTop: 4 }}>Refusé par la banque : taux d'endettement trop élevé.</div>}
                </div>
              );
            })()}
          </>
        )}

        <button className="btn-small" style={{ ...styles.smallBtn, width: "100%", boxSizing: "border-box", marginTop: 14 }} onClick={() => onSkip(card)}>Ignorer</button>
      </ModalShell>
    );
  }
  if (decision.kind === "market") {
    const { card, matching } = decision;
    return (
      <ModalShell>
        <div style={{ fontSize: 10, color: COLORS.teal, textTransform: "uppercase", letterSpacing: 2, fontWeight: 700 }}>Marché</div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 18, color: COLORS.ink, marginTop: 4, fontWeight: 700 }}>{card.title}</div>
        <div style={{ color: COLORS.inkSoft, fontSize: 13, marginTop: 6 }}>{card.desc}</div>
        <div style={{ fontSize: 11, color: COLORS.mustard, marginTop: 6, fontStyle: "italic" }}>N'affecte que la valeur de revente si vous vendez maintenant — votre revenu mensuel actuel ne change pas si vous gardez.</div>
        <div style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 8, fontStyle: "italic" }}>Concerne : {matching.map((m) => m.name).join(", ")}</div>
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button className="btn-primary" style={{ ...styles.primaryBtn, flex: 1 }} onClick={() => onMarket(card, matching, true)}>Vendre</button>
          <button className="btn-small" style={{ ...styles.smallBtn, flex: 1 }} onClick={() => onMarket(card, matching, false)}>Garder</button>
        </div>
      </ModalShell>
    );
  }
  if (decision.kind === "doodad") {
    const card = decision.card;
    const affordCash = cash >= card.amount;
    return (
      <ModalShell>
        <div style={{ fontSize: 10, color: COLORS.rust, textTransform: "uppercase", letterSpacing: 2, fontWeight: 700 }}>Imprévu</div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 18, color: COLORS.ink, marginTop: 4, fontWeight: 700 }}>{card.title}</div>
        {card.desc && <div style={{ color: COLORS.inkSoft, fontSize: 13, marginTop: 6 }}>{card.desc}</div>}
        <div style={styles.ledgerDivider} />
        <Row label="Coût" value={f(card.amount)} negative />
        {card.bankLoanAdd > 0 && <Row label="Dont financé automatiquement" value={f(card.bankLoanAdd)} />}
        {card.bankLoanAdd > 0 && <div style={{ fontSize: 10, color: COLORS.inkSoft, marginTop: 2, fontStyle: "italic" }}>Une partie de cet achat est de toute façon financée via le prêt bancaire (+{f(Math.round(card.bankLoanAdd * BANK_LOAN_RATE))}/mois), quel que soit votre choix ci-dessous.</div>}
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button className="btn-primary" style={{ ...styles.primaryBtn, flex: 1, opacity: affordCash ? 1 : 0.4 }} onClick={() => onDoodadCash(card)}>Payer comptant</button>
          <button className="btn-small" style={{ ...styles.smallBtn, flex: 1 }} onClick={() => onDoodadFinance(card)}>Financer</button>
        </div>
        {!affordCash && <div style={{ fontSize: 10, color: COLORS.inkSoft, marginTop: 6, fontStyle: "italic" }}>Liquidités insuffisantes : payer comptant forcera la revente d'actifs si besoin.</div>}
        <div style={{ fontSize: 10, color: COLORS.inkSoft, marginTop: 4, fontStyle: "italic" }}>Financer ajoute {f(card.amount)} au prêt bancaire (+{f(Math.round(card.amount * BANK_LOAN_RATE))}/mois) au lieu de payer comptant.</div>
      </ModalShell>
    );
  }
  if (decision.kind === "charity") {
    return (
      <ModalShell>
        <div style={{ fontSize: 10, color: COLORS.plum, textTransform: "uppercase", letterSpacing: 2, fontWeight: 700 }}>Don</div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 18, color: COLORS.ink, marginTop: 4, fontWeight: 700 }}>Faire un don ?</div>
        <div style={{ color: COLORS.inkSoft, fontSize: 13, marginTop: 6 }}>Donnez 10% de vos revenus totaux pour lancer 2 dés pendant 3 tours.</div>
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button className="btn-primary" style={{ ...styles.primaryBtn, flex: 1 }} onClick={() => onCharity(true)}>Donner</button>
          <button className="btn-small" style={{ ...styles.smallBtn, flex: 1 }} onClick={() => onCharity(false)}>Refuser</button>
        </div>
      </ModalShell>
    );
  }
  return null;
}
