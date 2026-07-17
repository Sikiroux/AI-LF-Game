import { useState } from "react";
import { fmt } from "../../../../utils/format.js";
import { SECTOR_LABELS } from "../../../../data/sectors.js";
import { computeFinancing, amortizedPayment, maxAmortMonths, MAX_DEBT_RATIO } from "../../../../engine/financing.js";
import { ACTION_COSTS } from "../../engine/actionPoints.js";
import { REALTIME_TICK_MS } from "../../engine/economicClock.js";
import { LISTING_BASE, AVAILABLE_LISTING_VARIANTS } from "../../data/imageManifest.js";
import { useCapitalLifeColors, getStyles, DISPLAY_FONT, sectorBadge } from "../../styles/theme.js";

const TYPE_LABELS = { realestate: "Immobilier", business: "Entreprise", stock: "Actions" };
const PHOTO_PREFIX = { realestate: "immobilier", business: "entreprise", stock: "actions" };

function photoFile(listing) {
  const variants = AVAILABLE_LISTING_VARIANTS[listing.card.type] || [];
  if (!variants.length) return null;
  const hash = listing.id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return `${PHOTO_PREFIX[listing.card.type]}-${variants[hash % variants.length]}.png`;
}

function Metric({ label, value, tone, C }) {
  return <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 7 }}><div style={{ fontSize: 9.5, color: C.inkSoft, textTransform: "uppercase" }}>{label}</div><div style={{ marginTop: 3, fontWeight: 700, color: tone === "good" ? C.good : tone === "bad" ? C.bad : C.ink }}>{value}</div></div>;
}

export default function OpportunityDetailModal({ listing, cash, currency, actionPoints, currentDebtPayments, totalIncome, loanRateMult = 1, onBuy, onInspect, onNegotiate, onClose }) {
  const C = useCapitalLifeColors();
  const styles = getStyles(C);
  const [showAmortization, setShowAmortization] = useState(false);
  const [months, setMonths] = useState(120);
  if (!listing) return null;

  const card = listing.card;
  const f = (value) => fmt(value, currency);
  const financeable = card.type !== "stock";
  const grossCashflow = card.cashflow;
  const cashAffordable = cash >= card.cost;
  const loan = financeable ? computeFinancing(card, "realistic", 30, loanRateMult, "realiste", 1) : null;
  const loanRatio = loan && totalIncome > 0 ? (currentDebtPayments + loan.loanMonthly) / totalIncome : 0;
  const loanAffordable = loan && cash >= loan.downPayment && loanRatio <= MAX_DEBT_RATIO;
  const maximumMonths = financeable ? maxAmortMonths(card.type) : 0;
  const selectedMonths = Math.min(months, maximumMonths || months);
  const amortizedMonthly = loan ? Math.round(amortizedPayment(loan.loanAmount, loan.annualRate, selectedMonths / 12)) : 0;
  const amortizedRatio = totalIncome > 0 ? (currentDebtPayments + amortizedMonthly) / totalIncome : 0;
  const amortizedAffordable = loan && cash >= loan.downPayment && amortizedRatio <= MAX_DEBT_RATIO;
  const yieldPct = card.cost > 0 ? (grossCashflow * 12 / card.cost) * 100 : 0;
  const photo = photoFile(listing);
  const tickSeconds = REALTIME_TICK_MS / 1000;
  const canInspect = actionPoints >= ACTION_COSTS.inspectListing && !listing.inspected;
  const canNegotiate = actionPoints >= ACTION_COSTS.negotiateListing && !listing.negotiated;

  return (
    <div role="dialog" aria-modal="true" aria-label={`Détail de ${card.title}`} style={{ position: "fixed", inset: 0, zIndex: 1000, background: C.backdrop, display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
      <div style={{ ...styles.card, position: "relative", width: "min(920px, 100%)", maxHeight: "calc(100vh - 24px)", overflowY: "auto", background: C.bg }}>
        <button className="cl-tap" type="button" aria-label="Fermer la fiche" onClick={onClose} style={{ ...styles.backBtn, position: "absolute", zIndex: 2, top: 10, right: 10, background: C.surfaceRaised, fontSize: 20, fontWeight: 700 }}>×</button>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.15fr) minmax(280px, .85fr)" }} className="cl-opportunity-detail-grid">
          <section>
            <div style={{ height: 250, position: "relative", background: C.placeholderBg, overflow: "hidden" }}>
              {photo ? <img src={`${LISTING_BASE}${photo}`} alt={card.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ ...styles.placeholderImg, height: "100%", color: C.inkSoft, fontSize: 12 }}>Image indisponible</div>}
              <span style={{ ...sectorBadge(card.sector, C), position: "absolute", top: 12, left: 12 }}>{TYPE_LABELS[card.type]}</span>
              <span style={{ position: "absolute", top: 12, right: 12, padding: "6px 10px", borderRadius: 999, background: C.surfaceRaised, color: C.ink, fontSize: 11, fontWeight: 700 }}>⏸ Offre réservée</span>
            </div>
            <div style={{ padding: 18 }}>
              <div style={{ fontFamily: DISPLAY_FONT, fontSize: 22, fontWeight: 700, color: C.ink }}>{card.title}</div>
              <div style={{ fontSize: 10.5, color: C.inkSoft, marginTop: 3 }}>{SECTOR_LABELS[card.sector] || TYPE_LABELS[card.type]}{card.stakePct != null ? ` · ${card.stakePct}% de participation` : ""}</div>
              <p style={{ color: C.inkSoft, fontSize: 13, lineHeight: 1.55 }}>{card.desc || "Une opportunité à analyser avant de vous engager."}</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(125px, 1fr))", gap: 12 }}>
                <Metric C={C} label="Prix total" value={f(card.cost)} />
                <Metric C={C} label="Apport minimal" value={f(loan?.downPayment ?? card.cost)} />
                <Metric C={C} label="Cash-flow brut" value={`+${f(grossCashflow)}/mois`} tone="good" />
                <Metric C={C} label="Rentabilité" value={`${yieldPct.toFixed(1)}%`} />
                <Metric C={C} label="Inspection" value={listing.inspected ? (listing.flawed ? "Vice détecté" : "Bien conforme") : "Non inspecté"} tone={listing.flawed && listing.inspected ? "bad" : listing.inspected ? "good" : undefined} />
                <Metric C={C} label="Prix" value={listing.negotiated ? "Négocié" : "Non négocié"} tone={listing.negotiated ? "good" : undefined} />
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
                <button className="cl-tap" style={{ ...styles.smallBtn, opacity: canInspect ? 1 : .45 }} disabled={!canInspect} onClick={() => onInspect(listing.id)}>Inspecter · ⚡{ACTION_COSTS.inspectListing}</button>
                <button className="cl-tap" style={{ ...styles.smallBtn, opacity: canNegotiate ? 1 : .45 }} disabled={!canNegotiate} onClick={() => onNegotiate(listing.id)}>Négocier · ⚡{ACTION_COSTS.negotiateListing}</button>
              </div>
            </div>
          </section>

          <aside style={{ padding: 18, background: C.surfaceRaised, borderLeft: `1px solid ${C.line}` }}>
            <div style={styles.sectionTitle}>Choisir le financement</div>
            <div style={{ fontSize: 11.5, color: C.inkSoft, marginBottom: 14 }}>Liquidités {f(cash)} · Endettement actuel {Math.round((currentDebtPayments / Math.max(1, totalIncome)) * 100)}%</div>
            <Metric C={C} label="Comptant" value={f(card.cost)} tone={cashAffordable ? undefined : "bad"} />
            <button className="cl-tap" style={{ ...styles.primaryBtn, width: "100%", margin: "8px 0 18px", opacity: cashAffordable ? 1 : .4 }} disabled={!cashAffordable} onClick={() => onBuy(card, false)}>Payer comptant</button>

            {financeable && <>
              <Metric C={C} label="Apport + intérêts seuls" value={`${f(loan.downPayment)} · ${f(loan.loanMonthly)}/mois`} tone={loanAffordable ? undefined : "bad"} />
              <div style={{ fontSize: 11, color: C.inkSoft, marginTop: 5 }}>Net +{f(loan.netCashflow)}/mois · Endettement {Math.round(loanRatio * 100)}%</div>
              <button className="cl-tap" style={{ ...styles.primaryBtn, width: "100%", marginTop: 8, opacity: loanAffordable ? 1 : .4 }} disabled={!loanAffordable} onClick={() => onBuy(card, true)}>Acheter avec financement</button>

              <button className="cl-tap" style={{ ...styles.smallBtn, width: "100%", marginTop: 16 }} onClick={() => setShowAmortization((value) => !value)}>{showAmortization ? "Masquer" : "Option amortissable"}</button>
              {showAmortization && <div style={{ marginTop: 12 }}>
                <label style={{ fontSize: 11.5, color: C.ink }}>Durée : {selectedMonths} mois</label>
                <input type="range" min="12" max={maximumMonths} step="6" value={selectedMonths} onChange={(event) => setMonths(Number(event.target.value))} style={{ width: "100%" }} />
                <div style={{ fontSize: 11.5, color: C.inkSoft }}>{f(amortizedMonthly)}/mois · Net +{f(grossCashflow - amortizedMonthly)}/mois · Dette {Math.round(amortizedRatio * 100)}%</div>
                <button className="cl-tap" style={{ ...styles.primaryBtn, width: "100%", marginTop: 8, opacity: amortizedAffordable ? 1 : .4 }} disabled={!amortizedAffordable} onClick={() => onBuy(card, selectedMonths)}>Acheter avec prêt amortissable</button>
              </div>}
            </>}

            <button className="cl-tap" style={{ ...styles.smallBtn, width: "100%", marginTop: 18 }} onClick={onClose}>Fermer la fiche</button>
            <div style={{ fontSize: 10.5, color: C.inkSoft, marginTop: 8 }}>⏸ Le compteur de cette offre est suspendu. Il reprendra à la fermeture. Une impulsion économique dure {tickSeconds} s.</div>
          </aside>
        </div>
      </div>
      <style>{`@media (max-width: 720px) { .cl-opportunity-detail-grid { grid-template-columns: 1fr !important; } .cl-opportunity-detail-grid aside { border-left: 0 !important; border-top: 1px solid ${C.line}; } }`}</style>
    </div>
  );
}
