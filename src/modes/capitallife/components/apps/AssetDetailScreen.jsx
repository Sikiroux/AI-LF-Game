import { useState } from "react";
import { fmt } from "../../../../utils/format.js";
import { SECTOR_LABELS } from "../../../../data/sectors.js";
import {
  qualitativeLabel, canPerformMaintenance, MAINTENANCE_COST_RATE,
  generateCandidate, trainingCost, fireSeverance, MAX_EMPLOYEES,
} from "../../engine/assetIndicators.js";
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

function EmployeeRow({ employee, cash, currency, onFire, onTrain, C, styles }) {
  const f = (n) => fmt(n, currency);
  const trainCost = trainingCost(employee);
  const severance = fireSeverance(employee);
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
        <button style={{ ...styles.smallBtn, flex: 1, opacity: cash >= trainCost ? 1 : 0.4 }} disabled={cash < trainCost} onClick={() => onTrain(employee.id)}>
          Former ({f(trainCost)})
        </button>
        <button style={{ ...styles.dangerBtn, flex: 1, opacity: cash >= severance ? 1 : 0.4 }} disabled={cash < severance} onClick={() => onFire(employee.id)}>
          Licencier ({f(severance)})
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
        Embaucher
      </button>
    </div>
  );
}

export default function AssetDetailScreen({ asset, cash, currency, day, onMaintenance, onHire, onFire, onTrain, onBack }) {
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

  return (
    <div style={styles.app}>
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={onBack}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{asset.name}</div>
          <div style={{ fontSize: 10, color: C.inkSoft, marginTop: 1 }}>{SECTOR_LABELS[asset.sector] || ""} · {TYPE_LABELS[asset.type] || asset.type}</div>
        </div>
      </div>

      <div style={{ flexShrink: 0, display: "flex", gap: 8, padding: "10px 16px", borderBottom: `1px solid ${C.line}` }}>
        {TABS.map((t) => (
          <button key={t.key} style={{ ...styles.chip, ...(tab === t.key ? styles.chipActive : {}) }} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
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
                  <Row C={C} label="Réputation" value={qualitativeLabel(asset.reputation)} />
                  <Row C={C} label="Moral du personnel" value={qualitativeLabel(asset.staffMorale)} />
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
                    style={{ ...styles.primaryBtn, width: "100%", boxSizing: "border-box", opacity: maintCheck.ok ? 1 : 0.4 }}
                    disabled={!maintCheck.ok}
                    onClick={() => onMaintenance(asset.id)}
                  >
                    Faire un entretien ({f(maintCost)})
                  </button>
                  {!maintCheck.ok && <div style={{ fontSize: 11, color: C.inkSoft, marginTop: 6 }}>{maintCheck.reason}</div>}
                </>
              )}
            </div>
          </div>
        )}

        {tab === "decisions" && !isRealestate && asset.employees && (
          <>
            <div style={{ ...styles.sectionTitle, marginTop: 18 }}>Employés ({asset.employees.length}/{MAX_EMPLOYEES})</div>
            {asset.employees.length === 0 && <div style={{ fontSize: 12.5, color: C.inkSoft, fontStyle: "italic", marginBottom: 10 }}>Aucun employé pour l'instant.</div>}
            {asset.employees.map((emp) => (
              <EmployeeRow key={emp.id} employee={emp} cash={cash} currency={currency} onFire={onFire} onTrain={onTrain} C={C} styles={styles} />
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
                  disabled={asset.employees.length >= MAX_EMPLOYEES}
                  onHire={(candidate) => { onHire(candidate); setCandidates((list) => list.filter((x) => x.id !== candidate.id)); }}
                  C={C} styles={styles}
                />
              ))
            )}
          </>
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
