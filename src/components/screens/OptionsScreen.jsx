import { useState } from "react";
import { MAX_DEBT_RATIO } from "../../engine/financing.js";
import { CURRENCIES, CURRENCY_ORDER } from "../../data/currencies.js";
import { styles, COLORS, CSS_EXTRA } from "../../styles/theme.js";

export default function OptionsScreen({ currency, onSelectCurrency, downPaymentPct, onChangeDownPayment, financingMode, onChangeFinancingMode, yieldMode, onChangeYieldMode, customYieldMultiplier, onChangeCustomYield, proceduralCards, onToggleProceduralCards, marketIncomeCardsEnabled, onToggleMarketIncomeCards, marketIncomeDurationMode, onChangeMarketIncomeDurationMode, marketIncomeDurationTurns, onChangeMarketIncomeDurationTurns, debtRatioEnabled, onToggleDebtRatio, economicEffectDuration, onChangeEconomicDuration, economicEffectPermanent, onTogglePermanent, bourseEnabled, onToggleBourse, casinoEnabled, onToggleCasino, onBack, onClearSave, hasSave, onManageJobs }) {
  const [confirmClear, setConfirmClear] = useState(false);
  return (
    <div style={{ ...styles.app, overflowY: "auto", padding: "26px 18px 40px", alignItems: "center", display: "flex", flexDirection: "column" }}>
      <style>{CSS_EXTRA}</style>
      <div style={{ width: "100%", maxWidth: 340 }}>
        <button className="btn-small" style={{ ...styles.smallBtn, marginBottom: 20 }} onClick={onBack}>← Menu</button>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 22, color: COLORS.ink, fontWeight: 700, marginBottom: 18, textAlign: "center" }}>Options</div>

        <div style={styles.sectionLabel}>Devise</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 6 }}>
          {CURRENCY_ORDER.map((code) => (
            <button key={code} className="chip-btn" style={{ ...styles.currencyChip, ...(currency === code ? styles.currencyChipActive : {}) }} onClick={() => onSelectCurrency(code)}>
              <span style={{ fontWeight: 700 }}>{CURRENCIES[code].symbol}</span> {CURRENCIES[code].label}
            </button>
          ))}
        </div>
        <div style={{ textAlign: "center", fontSize: 10, color: COLORS.inkSoft, marginBottom: 26 }}>Montants calculés en euros, convertis au taux actuel.</div>

        <div style={styles.sectionLabel}>Modules du jeu</div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: COLORS.ink, marginBottom: 6 }}>
          <input type="checkbox" checked={bourseEnabled} onChange={onToggleBourse} />
          📈 Bourse activée
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: COLORS.ink, marginBottom: 26 }}>
          <input type="checkbox" checked={casinoEnabled} onChange={onToggleCasino} />
          🎰 Casino activé
        </label>

        <div style={styles.sectionLabel}>Rendement des opportunités</div>
        <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginBottom: 6 }}>
          <button className="chip-btn" style={{ ...styles.currencyChip, ...(yieldMode === "realiste" ? styles.currencyChipActive : {}) }} onClick={() => onChangeYieldMode("realiste")}>Réaliste (8-15%/an)</button>
          <button className="chip-btn" style={{ ...styles.currencyChip, ...(yieldMode === "cashflow" ? styles.currencyChipActive : {}) }} onClick={() => onChangeYieldMode("cashflow")}>Cashflow (jeu de base)</button>
          <button className="chip-btn" style={{ ...styles.currencyChip, ...(yieldMode === "personnalise" ? styles.currencyChipActive : {}) }} onClick={() => onChangeYieldMode("personnalise")}>Personnalisé</button>
        </div>
        {yieldMode === "personnalise" && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, padding: "0 4px" }}>
            <input type="range" min="0.5" max="15" step="0.5" value={customYieldMultiplier} onChange={(e) => onChangeCustomYield(Number(e.target.value))} style={{ flex: 1 }} />
            <div style={{ fontFamily: "'Courier New', monospace", fontWeight: 700, color: COLORS.ink, width: 48, textAlign: "right" }}>×{customYieldMultiplier}</div>
          </div>
        )}
        <div style={{ textAlign: "center", fontSize: 10, color: COLORS.inkSoft, marginBottom: 26 }}>Multiplie le revenu de base des cartes Opportunité. Une carte "🌟 exceptionnelle" (~3% de chance) rapporte toujours bien plus, quel que soit le mode.</div>

        <div style={styles.sectionLabel}>Cartes d'opportunité</div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: COLORS.ink, marginBottom: 6, justifyContent: "center" }}>
          <input type="checkbox" checked={proceduralCards} onChange={onToggleProceduralCards} />
          Génération procédurale (nouvelles cartes à chaque partie)
        </label>
        <div style={{ textAlign: "center", fontSize: 10, color: COLORS.inkSoft, marginBottom: 26 }}>Si désactivé, la même liste de 30+30 cartes calibrées est utilisée à chaque partie. Si activé, prix/apports/rendements sont tirés au hasard selon les mêmes paliers de qualité (prend effet à la prochaine partie).</div>

        <div style={styles.sectionLabel}>Cartes Marché — revenu passif</div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: COLORS.ink, marginBottom: 8, justifyContent: "center" }}>
          <input type="checkbox" checked={marketIncomeCardsEnabled} onChange={onToggleMarketIncomeCards} />
          Activer les cartes qui changent le revenu mensuel
        </label>
        {marketIncomeCardsEnabled && (
          <>
            <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginBottom: 6 }}>
              <button className="chip-btn" style={{ ...styles.currencyChip, ...(marketIncomeDurationMode === "permanent" ? styles.currencyChipActive : {}) }} onClick={() => onChangeMarketIncomeDurationMode("permanent")}>Permanent (toute la partie)</button>
              <button className="chip-btn" style={{ ...styles.currencyChip, ...(marketIncomeDurationMode === "temporary" ? styles.currencyChipActive : {}) }} onClick={() => onChangeMarketIncomeDurationMode("temporary")}>Temporaire</button>
            </div>
            {marketIncomeDurationMode === "temporary" && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, padding: "0 4px" }}>
                <input type="range" min="3" max="30" step="1" value={marketIncomeDurationTurns} onChange={(e) => onChangeMarketIncomeDurationTurns(Number(e.target.value))} style={{ flex: 1 }} />
                <div style={{ fontFamily: "'Courier New', monospace", fontWeight: 700, color: COLORS.ink, width: 78, textAlign: "right" }}>{marketIncomeDurationTurns} tours (dés)</div>
              </div>
            )}
          </>
        )}
        <div style={{ textAlign: "center", fontSize: 10, color: COLORS.inkSoft, marginBottom: 26 }}>Ces cartes augmentent ou réduisent directement le revenu mensuel de vos actifs concernés. En mode temporaire, l'effet s'annule tout seul après le nombre de lancers de dé choisi.</div>

        <div style={styles.sectionLabel}>Mode de financement</div>
        <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginBottom: 6 }}>
          <button className="chip-btn" style={{ ...styles.currencyChip, ...(financingMode === "simple" ? styles.currencyChipActive : {}) }} onClick={() => onChangeFinancingMode("simple")}>Simplifié</button>
          <button className="chip-btn" style={{ ...styles.currencyChip, ...(financingMode === "realistic" ? styles.currencyChipActive : {}) }} onClick={() => onChangeFinancingMode("realistic")}>Réaliste par secteur</button>
        </div>
        <div style={{ textAlign: "center", fontSize: 10, color: COLORS.inkSoft, marginBottom: 12 }}>
          {financingMode === "realistic"
            ? "Apport minimum et taux propres à chaque type : actions 100% comptant, immobilier 20% à 5%/an, business 30% à 8%/an. Le curseur ci-dessous sert de plancher supplémentaire."
            : "Un seul curseur s'applique à toutes les opportunités, taux fixe à 1%/mois."}
        </div>

        <div style={styles.sectionLabel}>Apport personnel {financingMode === "realistic" ? "(plancher)" : ""}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, padding: "0 4px" }}>
          <input type="range" min="0" max="50" step="5" value={downPaymentPct} onChange={(e) => onChangeDownPayment(Number(e.target.value))} style={{ flex: 1 }} />
          <div style={{ fontFamily: "'Courier New', monospace", fontWeight: 700, color: COLORS.ink, width: 42, textAlign: "right" }}>{downPaymentPct}%</div>
        </div>
        <div style={{ textAlign: "center", fontSize: 10, color: COLORS.inkSoft, marginBottom: 12 }}>{financingMode === "realistic" ? "Relève l'apport au-dessus du minimum du secteur si besoin." : "Part payée comptant sur les opportunités immobilières/business ; le reste est emprunté (mensualité 0,5%/mois)."}</div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: COLORS.ink, marginBottom: 6, justifyContent: "center" }}>
          <input type="checkbox" checked={debtRatioEnabled} onChange={onToggleDebtRatio} />
          Taux d'endettement maximum ({Math.round(MAX_DEBT_RATIO * 100)}%)
        </label>
        <div style={{ textAlign: "center", fontSize: 10, color: COLORS.inkSoft, marginBottom: 26 }}>Si activé, la banque refuse un emprunt qui ferait dépasser {Math.round(MAX_DEBT_RATIO * 100)}% de vos revenus en mensualités de dettes.</div>

        <div style={styles.sectionLabel}>Conséquences économiques (Bourse)</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, padding: "0 4px", opacity: economicEffectPermanent ? 0.4 : 1 }}>
          <input type="range" min="5" max="20" step="1" value={economicEffectDuration} disabled={economicEffectPermanent} onChange={(e) => onChangeEconomicDuration(Number(e.target.value))} style={{ flex: 1 }} />
          <div style={{ fontFamily: "'Courier New', monospace", fontWeight: 700, color: COLORS.ink, width: 60, textAlign: "right" }}>{economicEffectDuration} tours</div>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: COLORS.ink, marginBottom: 6, justifyContent: "center" }}>
          <input type="checkbox" checked={economicEffectPermanent} onChange={onTogglePermanent} />
          Effets permanents (plus réaliste, plus difficile)
        </label>
        <div style={{ textAlign: "center", fontSize: 10, color: COLORS.inkSoft, marginBottom: 26 }}>Durée pendant laquelle une faillite/boom sectoriel affecte les opportunités de la course infernale.</div>

        <div style={styles.sectionLabel}>Métiers</div>
        <button className="btn-small" style={{ ...styles.smallBtn, width: "100%", boxSizing: "border-box", marginBottom: 26 }} onClick={onManageJobs}>Gérer mes métiers personnalisés</button>

        {hasSave && (
          <>
            <div style={styles.sectionLabel}>Sauvegarde</div>
            {confirmClear ? (
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-small" style={{ ...styles.smallBtnDanger, flex: 1 }} onClick={onClearSave}>Confirmer l'effacement</button>
                <button className="btn-small" style={{ ...styles.smallBtn, flex: 1 }} onClick={() => setConfirmClear(false)}>Annuler</button>
              </div>
            ) : (
              <button className="btn-small" style={{ ...styles.smallBtnDanger, width: "100%", boxSizing: "border-box" }} onClick={() => setConfirmClear(true)}>Effacer la partie en cours</button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
