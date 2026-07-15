import { useState } from "react";
import { fmt } from "../../../../utils/format.js";
import { SECTOR_LABELS } from "../../../../data/sectors.js";
import {
  qualitativeLabel, canPerformMaintenance, MAINTENANCE_COST_RATE,
  generateCandidate, trainingCost, fireSeverance, MAX_EMPLOYEES,
  canManage, DEFAULT_MANAGEMENT_THRESHOLD_PCT, canRunAd, AD_COST_RATE,
} from "../../engine/assetIndicators.js";
import { computeFinancing } from "../../../../engine/financing.js";
import { ACTION_COSTS } from "../../engine/actionPoints.js";
import { useCapitalLifeColors, getStyles } from "../../styles/theme.js";

const TYPE_LABELS = { stock: "Actions", realestate: "Immobilier", business: "Business" };
const TABS = [
  { key: "vue", label: "Vue" },
  { key: "decisions", label: "Décisions" },
  { key: "historique", label: "Historique" },
];

function Row({ label, value, tone, C }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "4px 0" }}>
      <span style={{ color: C.inkSoft }}>{label}</span>
      <span style={{ fontFamily: "ui-monospace, monospace", fontVariantNumeric: "tabular-nums", color: tone === "bad" ? C.bad : tone === "good" ? C.good : C.ink }}>{value}</span>
    </div>
  );
}

function labelTone(label, C) {
  if (label === "Excellent" || label === "Bon") return C.good;
  if (label === "Moyen") return C.warn;
  if (label === "Fragile" || label === "Critique") return C.bad;
  return C.ink;
}

function EmployeeRow({ employee, cash, actionPoints, currency, onFire, onTrain, C, styles }) {
  const f = (n) => fmt(n, currency);
  const trainCost = trainingCost(employee);
  const severance = fireSeverance(employee);
  const canTrain = cash >= trainCost && actionPoints >= ACTION_COSTS.train;
  const canFire = cash >= severance && actionPoints >= ACTION_COSTS.fire;
  return (
    <div style={{ ...styles.card, padding: 12, marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: C.ink }}>{employee.name}</div>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, color: C.bad }}>-{f(employee.salary)}/mois</div>
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 6, fontSize: 11 }}>
        <span style={{ color: C.inkSoft }}>Compétence <b style={{ color: C.ink }}>{qualitativeLabel(employee.competence)}</b></span>
        <span style={{ color: C.inkSoft }}>Motivation <b style={{ color: C.ink }}>{qualitativeLabel(employee.motivation)}</b></span>
        <span style={{ color: C.inkSoft }}>Loyauté <b style={{ color: C.ink }}>{qualitativeLabel(employee.loyalty)}</b></span>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button style={{ ...styles.smallBtn, flex: 1, opacity: canTrain ? 1 : 0.4 }} disabled={!canTrain} onClick={() => onTrain(employee.id)}>
          Former ({f(trainCost)} · ⚡{ACTION_COSTS.train})
        </button>
        <button style={{ ...styles.dangerBtn, flex: 1, opacity: canFire ? 1 : 0.4 }} disabled={!canFire} onClick={() => onFire(employee.id)}>
          Licencier ({f(severance)} · ⚡{ACTION_COSTS.fire})
        </button>
      </div>
    </div>
  );
}

function CandidateRow({ candidate, currency, onHire, disabled, C, styles }) {
  const f = (n) => fmt(n, currency);
  return (
    <div style={{ ...styles.card, padding: 12, marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: C.ink }}>{candidate.name}</div>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, color: C.inkSoft }}>{f(candidate.salary)}/mois</div>
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 6, fontSize: 11 }}>
        <span style={{ color: C.inkSoft }}>Compétence <b style={{ color: C.ink }}>{qualitativeLabel(candidate.competence)}</b></span>
        <span style={{ color: C.inkSoft }}>Motivation <b style={{ color: C.ink }}>{qualitativeLabel(candidate.motivation)}</b></span>
        <span style={{ color: C.inkSoft }}>Loyauté <b style={{ color: C.ink }}>{qualitativeLabel(candidate.loyalty)}</b></span>
      </div>
      <button style={{ ...styles.primaryBtn, width: "100%", boxSizing: "border-box", marginTop: 10, opacity: disabled ? 0.4 : 1 }} disabled={disabled} onClick={() => onHire(candidate)}>
        Embaucher (⚡{ACTION_COSTS.hire})
      </button>
    </div>
  );
}

function TreasurySection({ asset, currency, onPayDividend, onToggleAutoManage, C, styles }) {
  const [amount, setAmount] = useState(asset.treasury || 0);
  const f = (n) => fmt(n, currency);
  const treasury = asset.treasury || 0;
  const clamped = Math.max(0, Math.min(amount, treasury));

  return (
    <div style={{ ...styles.card, marginTop: 14 }}>
      <div style={{ padding: 16 }}>
        <div style={styles.sectionTitle}>Trésorerie d'entreprise</div>
        <div style={{ fontSize: 11.5, color: C.inkSoft, marginBottom: 12, lineHeight: 1.5 }}>
          Une partie du cash-flow de l'entreprise reste dans ses caisses au lieu de tomber automatiquement dans vos liquidités — versez-vous un dividende pour la récupérer.
        </div>
        <Row C={C} label="Trésorerie disponible" value={f(treasury)} tone={treasury > 0 ? "good" : undefined} />
        {treasury > 0 && (
          <>
            <div style={{ display: "flex", gap: 6, margin: "10px 0" }}>
              {[0.25, 0.5, 1].map((pct) => (
                <button key={pct} style={{ ...styles.chip, ...(clamped === Math.round(treasury * pct) ? styles.chipActive : {}) }} onClick={() => setAmount(Math.round(treasury * pct))}>
                  {pct === 1 ? "Tout" : `${Math.round(pct * 100)}%`}
                </button>
              ))}
            </div>
            <button style={{ ...styles.primaryBtn, width: "100%", boxSizing: "border-box" }} onClick={() => onPayDividend(clamped)}>
              Se verser {f(clamped)} de dividende
            </button>
          </>
        )}
        <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 12, color: C.ink, cursor: "pointer" }}>
          <input type="checkbox" checked={!!asset.autoManage} onChange={onToggleAutoManage} />
          Gestion automatique (entretien/pub financés par la trésorerie, sans PA)
        </label>
      </div>
    </div>
  );
}

function StakeSection({ asset, cash, actionPoints, currency, managementThreshold, onBuyStake, C, styles }) {
  const [deltaPct, setDeltaPct] = useState(10);
  const f = (n) => fmt(n, currency);
  const currentPct = asset.stakePct ?? 100;
  const remaining = 100 - currentPct;
  const presets = [10, 25, remaining].filter((v, i, arr) => v > 0 && v <= remaining && arr.indexOf(v) === i);
  const clampedDelta = Math.min(deltaPct, remaining);
  const perPctCost = asset.cost / currentPct;
  const perPctGross = (asset.baseGrossCashflow ?? asset.grossCashflow ?? 0) / currentPct;
  const addedCost = Math.round(perPctCost * clampedDelta);
  const addedGross = Math.round(perPctGross * clampedDelta);
  const fin = computeFinancing({ cost: addedCost, cashflow: addedGross, type: "business" }, "simple", 10, 1, "realiste", 1);
  const paOk = actionPoints == null || actionPoints >= ACTION_COSTS.buyAsset;
  const affordCash = cash >= addedCost && paOk;
  const affordLoan = cash >= fin.downPayment && paOk;
  const willUnlock = currentPct < managementThreshold && currentPct + clampedDelta >= managementThreshold;

  if (remaining <= 0) return null;

  return (
    <div style={{ ...styles.card, marginTop: 14 }}>
      <div style={{ padding: 16 }}>
        <div style={styles.sectionTitle}>Participation</div>
        <Row C={C} label="Détenu actuellement" value={`${currentPct}%`} />
        <div style={{ fontSize: 11.5, color: C.inkSoft, margin: "6px 0 12px", lineHeight: 1.5 }}>
          {currentPct >= managementThreshold
            ? "Vous détenez assez de parts pour gérer le personnel."
            : `Détenez au moins ${managementThreshold}% pour débloquer la gestion du personnel.`}
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          {presets.map((opt) => (
            <button key={opt} style={{ ...styles.chip, ...(clampedDelta === opt ? styles.chipActive : {}) }} onClick={() => setDeltaPct(opt)}>
              +{opt}%{opt === remaining ? " (tout)" : ""}
            </button>
          ))}
        </div>
        <Row C={C} label={`Coût pour +${clampedDelta}%`} value={f(addedCost)} />
        <Row C={C} label="Cash-flow supplémentaire" value={`+${f(addedGross)}/mois`} tone="good" />
        {willUnlock && <div style={{ fontSize: 11, color: C.good, marginTop: 4, fontWeight: 700 }}>🔓 Débloque la gestion du personnel</div>}
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button style={{ ...styles.primaryBtn, flex: 1, opacity: affordCash ? 1 : 0.4 }} disabled={!affordCash} onClick={() => onBuyStake(clampedDelta, false)}>
            Payer comptant (⚡{ACTION_COSTS.buyAsset})
          </button>
          <button style={{ ...styles.smallBtn, flex: 1, opacity: affordLoan ? 1 : 0.4 }} disabled={!affordLoan} onClick={() => onBuyStake(clampedDelta, true)}>
            Financer ({f(fin.downPayment)} apport)
          </button>
        </div>
        {!paOk && <div style={{ fontSize: 11, color: C.inkSoft, marginTop: 6 }}>Plus assez de points d'action aujourd'hui.</div>}
      </div>
    </div>
  );
}

export default function AssetDetailScreen({ asset, cash, currency, day, actionPoints, managementThreshold = DEFAULT_MANAGEMENT_THRESHOLD_PCT, onMaintenance, onAd, onHire, onFire, onTrain, onBuyStake, onPayDividend, onToggleAutoManage, onBack }) {
  const C = useCapitalLifeColors();
  const styles = getStyles(C);
  const [tab, setTab] = useState("vue");
  const f = (n) => fmt(n, currency);
  const refSalary = asset ? Math.max(200, Math.round((asset.baseGrossCashflow ?? asset.grossCashflow ?? asset.cashflow) * 0.18)) : 200;
  const [candidates, setCandidates] = useState(() => Array.from({ length: 3 }, () => generateCandidate(refSalary)));
  const regenerateCandidates = () => setCandidates(Array.from({ length: 3 }, () => generateCandidate(refSalary)));

  if (!asset) {
    return (
      <div style={styles.app}>
        <div style={styles.topBar}>
          <button style={styles.backBtn} onClick={onBack}>←</button>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Actif introuvable</div>
        </div>
      </div>
    );
  }

  const isRealestate = asset.type === "realestate";
  const conditionLabel = qualitativeLabel(asset.condition);
  const stabilityLabel = qualitativeLabel(asset.stability);
  const maintCheck = canPerformMaintenance(asset, day, cash);
  const maintCost = Math.round(asset.cost * MAINTENANCE_COST_RATE);
  const maintPaOk = actionPoints == null || actionPoints >= ACTION_COSTS.maintenance;
  const canMaintain = maintCheck.ok && maintPaOk;
  const adCheck = canRunAd(asset, day, cash);
  const adCost = Math.round(asset.cost * AD_COST_RATE);
  const adPaOk = actionPoints == null || actionPoints >= ACTION_COSTS.ad;
  const canAd = adCheck.ok && adPaOk;

  return (
    <div style={styles.app}>
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={onBack}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{asset.name}</div>
          <div style={{ fontSize: 10, color: C.inkSoft, marginTop: 1 }}>{SECTOR_LABELS[asset.sector] || ""} · {TYPE_LABELS[asset.type] || asset.type}</div>
        </div>
      </div>

      <div style={{ flexShrink: 0, display: "flex", padding: "10px 16px", borderBottom: `1px solid ${C.line}` }}>
        <div style={{ ...styles.centerCol, display: "flex", gap: 8 }}>
          {TABS.map((t) => (
            <button key={t.key} style={{ ...styles.chip, ...(tab === t.key ? styles.chipActive : {}) }} onClick={() => setTab(t.key)}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ ...styles.content, padding: 16 }}>
        {tab === "vue" && (
          <>
            <div style={styles.card}>
              <div style={{ padding: 16 }}>
                <div style={styles.sectionTitle}>Aperçu</div>
                <Row C={C} label="Cash-flow" value={`${asset.cashflow >= 0 ? "+" : ""}${f(asset.cashflow)}/mois`} tone={asset.cashflow >= 0 ? "good" : "bad"} />
                <Row C={C} label="Valeur d'acquisition" value={f(asset.cost)} />
                {conditionLabel && <Row C={C} label="État" value={conditionLabel} />}
                {stabilityLabel && <Row C={C} label="Santé globale" value={stabilityLabel} />}
              </div>
            </div>

            {isRealestate && asset.tenant && (
              <div style={{ ...styles.card, marginTop: 14 }}>
                <div style={{ padding: 16 }}>
                  <div style={styles.sectionTitle}>Locataire</div>
                  <Row C={C} label="Fiabilité" value={qualitativeLabel(asset.tenant.reliability)} />
                  <Row C={C} label="Satisfaction" value={qualitativeLabel(asset.tenant.happiness)} />
                  <Row C={C} label="Ancienneté" value={`${asset.tenant.tenureMonths} mois`} />
                </div>
              </div>
            )}

            {!isRealestate && asset.reputation != null && (
              <div style={{ ...styles.card, marginTop: 14 }}>
                <div style={{ padding: 16 }}>
                  <div style={styles.sectionTitle}>Entreprise</div>
                  {(asset.stakePct ?? 100) < 100 && <Row C={C} label="Participation" value={`${asset.stakePct}%`} />}
                  <Row C={C} label="Réputation" value={qualitativeLabel(asset.reputation)} />
                  {asset.staffMorale != null && <Row C={C} label="Moral du personnel" value={qualitativeLabel(asset.staffMorale)} />}
                  <Row C={C} label="Trésorerie" value={f(asset.treasury || 0)} tone={asset.treasury > 0 ? "good" : undefined} />
                  {asset.autoManage && <Row C={C} label="Gestion" value="Automatique" tone="good" />}
                </div>
              </div>
            )}

            {asset.loanBalance > 0 && (
              <div style={{ ...styles.card, marginTop: 14 }}>
                <div style={{ padding: 16 }}>
                  <div style={styles.sectionTitle}>Financement</div>
                  <Row C={C} label="Solde dû" value={f(asset.loanBalance)} tone="bad" />
                  <Row C={C} label="Mensualité" value={f(asset.loanMonthly)} tone="bad" />
                </div>
              </div>
            )}
          </>
        )}

        {tab === "decisions" && (
          <div style={styles.card}>
            <div style={{ padding: 16 }}>
              <div style={styles.sectionTitle}>Entretien préventif</div>
              <div style={{ fontSize: 12.5, color: C.inkSoft, marginBottom: 12, lineHeight: 1.5 }}>
                Améliore l'état de l'actif et réduit le risque de panne ou de problème dans les mois qui suivent.
              </div>
              {asset.condition == null ? (
                <div style={{ fontSize: 12.5, color: C.inkSoft, fontStyle: "italic" }}>Aucune action de gestion disponible pour ce type d'actif.</div>
              ) : (
                <>
                  <button
                    style={{ ...styles.primaryBtn, width: "100%", boxSizing: "border-box", opacity: canMaintain ? 1 : 0.4 }}
                    disabled={!canMaintain}
                    onClick={() => onMaintenance(asset.id)}
                  >
                    Faire un entretien ({f(maintCost)} · ⚡{ACTION_COSTS.maintenance})
                  </button>
    {!maintCheck.ok && <div style={{ fontSize: 11, color: C.inkSoft, marginTop: 6 }}>{maintCheck.reason}</div>}
                  {maintCheck.ok && !maintPaOk && <div style={{ fontSize: 11, color: C.inkSoft, marginTop: 6 }}>Plus assez de points d'action aujourd'hui.</div>}
                </>
              )}
            </div>
          </div>
        )}

        {tab === "decisions" && !isRealestate && (
          <div style={{ ...styles.card, marginTop: 14 }}>
            <div style={{ padding: 16 }}>
              <div style={styles.sectionTitle}>Publicité</div>
              <div style={{ fontSize: 12.5, color: C.inkSoft, marginBottom: 12, lineHeight: 1.5 }}>
                Booste la réputation de l'entreprise, ce qui améliore sa santé globale et sa rentabilité au fil des mois.
              </div>
              <button
                style={{ ...styles.primaryBtn, width: "100%", boxSizing: "border-box", opacity: canAd ? 1 : 0.4 }}
                disabled={!canAd}
                onClick={() => onAd(asset.id)}
              >
                Faire de la pub ({f(adCost)} · ⚡{ACTION_COSTS.ad})
              </button>
              {!adCheck.ok && <div style={{ fontSize: 11, color: C.inkSoft, marginTop: 6 }}>{adCheck.reason}</div>}
              {adCheck.ok && !adPaOk && <div style={{ fontSize: 11, color: C.inkSoft, marginTop: 6 }}>Plus assez de points d'action aujourd'hui.</div>}
            </div>
          </div>
        )}

        {tab === "decisions" && !isRealestate && (
          <TreasurySection asset={asset} currency={currency} onPayDividend={onPayDividend} onToggleAutoManage={onToggleAutoManage} C={C} styles={styles} />
        )}

        {tab === "decisions" && !isRealestate && (
          <StakeSection asset={asset} cash={cash} actionPoints={actionPoints} currency={currency} managementThreshold={managementThreshold} onBuyStake={(delta, useLoan) => onBuyStake(asset.id, delta, useLoan)} C={C} styles={styles} />
        )}

        {tab === "decisions" && !isRealestate && (
          canManage(asset, managementThreshold) ? (
            asset.employees && (
              <>
                <div style={{ ...styles.sectionTitle, marginTop: 18 }}>Employés ({asset.employees.length}/{MAX_EMPLOYEES})</div>
                {asset.employees.length === 0 && <div style={{ fontSize: 12.5, color: C.inkSoft, fontStyle: "italic", marginBottom: 10 }}>Aucun employé pour l'instant.</div>}
                {asset.employees.map((emp) => (
                  <EmployeeRow key={emp.id} employee={emp} cash={cash} actionPoints={actionPoints} currency={currency} onFire={onFire} onTrain={onTrain} C={C} styles={styles} />
                ))}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18, marginBottom: 4 }}>
                  <div style={styles.sectionTitle}>Recruter</div>
                  <button style={{ ...styles.smallBtn, padding: "4px 10px", fontSize: 11 }} onClick={regenerateCandidates}>↻ Autres candidats</button>
                </div>
                {asset.employees.length >= MAX_EMPLOYEES ? (
                  <div style={{ fontSize: 12.5, color: C.inkSoft, fontStyle: "italic" }}>Effectif maximum atteint.</div>
                ) : (
                  candidates.map((c) => (
                    <CandidateRow
                      key={c.id} candidate={c} currency={currency}
                      disabled={asset.employees.length >= MAX_EMPLOYEES || (actionPoints != null && actionPoints < ACTION_COSTS.hire)}
                      onHire={(candidate) => { onHire(candidate); setCandidates((list) => list.filter((x) => x.id !== candidate.id)); }}
                      C={C} styles={styles}
                    />
                  ))
                )}
              </>
            )
          ) : (
            <div style={{ ...styles.card, marginTop: 18 }}>
              <div style={{ padding: 16 }}>
                <div style={styles.sectionTitle}>Personnel</div>
                <div style={{ fontSize: 12.5, color: C.inkSoft, lineHeight: 1.5 }}>
                  Vous détenez {asset.stakePct ?? 100}% de cette entreprise — rachetez des parts jusqu'à {managementThreshold}% pour débloquer le recrutement et la gestion du personnel.
                </div>
              </div>
            </div>
          )
        )}

        {tab === "historique" && (
          <div style={styles.card}>
            <div style={{ padding: "14px 16px 4px" }}>
              <div style={styles.sectionTitle}>Derniers événements</div>
              {(!asset.history || asset.history.length === 0) && (
                <div style={{ fontSize: 12.5, color: C.inkSoft, fontStyle: "italic", paddingBottom: 12 }}>Rien à signaler pour l'instant.</div>
              )}
              {(asset.history || []).map((h, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: `1px solid ${C.line}` }}>
                  <div style={{ width: 8, height: 8, borderRadius: 4, background: labelTone(h.tone === "good" ? "Bon" : h.tone === "bad" ? "Fragile" : "Moyen", C), marginTop: 5, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>{h.title} <span style={{ fontWeight: 400, color: C.inkSoft }}>· jour {h.day}</span></div>
                    <div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 2 }}>{h.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
