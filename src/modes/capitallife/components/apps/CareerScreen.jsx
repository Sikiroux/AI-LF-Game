import { useState } from "react";
import { fmt } from "../../../../utils/format.js";
import { SKILLS, SKILL_LABELS } from "../../../../data/skills.js";
import { PROFESSIONS } from "../../../../data/professions.js";
import {
  skillLevelLabel, TRAININGS, jobRequirementsMet, applicationChance,
  JOB_APPLY_PA_COST, JOB_REJECTION_COOLDOWN_DAYS,
} from "../../engine/career.js";
import { useCapitalLifeColors, getStyles } from "../../styles/theme.js";

const TABS = [
  { key: "competences", label: "Compétences" },
  { key: "emploi", label: "Emploi" },
  { key: "missions", label: "Missions" },
];

function Row({ label, value, tone, C }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "4px 0" }}>
      <span style={{ color: C.inkSoft }}>{label}</span>
      <span style={{ fontFamily: "ui-monospace, monospace", fontVariantNumeric: "tabular-nums", color: tone === "bad" ? C.bad : tone === "good" ? C.good : C.ink }}>{value}</span>
    </div>
  );
}

export default function CareerScreen({
  profession, skills, training, missions, cash, currency, day, actionPoints, dailyActionPoints,
  daysWithoutRest, enCouple, lastJobRejectionDay,
  onBeginTraining, onApplyToJob, onDoMission, onBack,
}) {
  const C = useCapitalLifeColors();
  const styles = getStyles(C);
  const [tab, setTab] = useState("competences");
  const [selectedSkill, setSelectedSkill] = useState(SKILLS[0].key);
  const f = (n) => fmt(n, currency);

  const cooldownLeft = lastJobRejectionDay != null ? JOB_REJECTION_COOLDOWN_DAYS - (day - lastJobRejectionDay) : 0;

  return (
    <div style={styles.app}>
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={onBack}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>💼 Carrière</div>
          <div style={{ fontSize: 10, color: C.inkSoft, marginTop: 1 }}>
            {profession.name} · {f(profession.salary)}/mois
            {daysWithoutRest > 0 && <> · <span style={{ color: daysWithoutRest > 3 ? C.bad : C.inkSoft, fontWeight: 600 }}>{daysWithoutRest}j sans repos</span></>}
          </div>
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
        {tab === "competences" && (
          <>
            <div style={styles.card}>
              <div style={{ padding: 16 }}>
                <div style={styles.sectionTitle}>Vos compétences</div>
                {SKILLS.map((s) => {
                  const level = skills[s.key] || 0;
                  return (
                    <div key={s.key} style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                        <span style={{ color: C.ink }}>{s.label}</span>
                        <span style={{ color: C.inkSoft }}>{skillLevelLabel(level)} · {level}</span>
                      </div>
                      <div style={{ height: 4, borderRadius: 2, background: C.line, marginTop: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", background: C.accent, width: `${level}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ ...styles.card, marginTop: 14 }}>
              <div style={{ padding: 16 }}>
                <div style={styles.sectionTitle}>Formation</div>
                {training ? (
                  <>
                    <div style={{ fontSize: 12.5, color: C.ink, marginBottom: 6 }}>
                      {training.label} en <b>{SKILL_LABELS[training.skillKey]}</b>
                    </div>
                    <Row C={C} label="Jours restants" value={`${training.daysRemaining}/${training.totalDays}`} />
                    <Row C={C} label="Coût quotidien" value={`-${training.paCost} PA/jour`} tone="bad" />
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 11.5, color: C.inkSoft, marginBottom: 10 }}>Choisissez la compétence à développer, puis une formation.</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                      {SKILLS.map((s) => (
                        <button key={s.key} style={{ ...styles.chip, ...(selectedSkill === s.key ? styles.chipActive : {}) }} onClick={() => setSelectedSkill(s.key)}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                    {TRAININGS.map((t) => {
                      const afford = cash >= t.cashCost;
                      return (
                        <div key={t.key} style={{ ...styles.card, padding: 12, marginBottom: 8 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: C.ink }}>{t.label}</div>
                            <div style={{ fontSize: 11, color: C.inkSoft }}>{t.days} jours</div>
                          </div>
                          <div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 4 }}>-{t.paCost} PA/jour · +{t.skillGain} en {SKILL_LABELS[selectedSkill]}</div>
                          <button
                            style={{ ...styles.primaryBtn, width: "100%", boxSizing: "border-box", marginTop: 8, opacity: afford ? 1 : 0.4 }}
                            disabled={!afford}
                            onClick={() => onBeginTraining(selectedSkill, t.key)}
                          >
                            Commencer ({f(t.cashCost)})
                          </button>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {tab === "emploi" && (
          <>
            <div style={styles.card}>
              <div style={{ padding: 16 }}>
                <div style={styles.sectionTitle}>Poste actuel</div>
                <Row C={C} label="Métier" value={profession.name} />
                <Row C={C} label="Salaire" value={`${f(profession.salary)}/mois`} tone="good" />
              </div>
            </div>

            <div style={{ ...styles.sectionTitle, marginTop: 18 }}>Job board</div>
            {cooldownLeft > 0 && (
              <div style={{ fontSize: 11, color: C.bad, marginBottom: 10 }}>
                Candidature refusée récemment — revenez dans {cooldownLeft} jour{cooldownLeft > 1 ? "s" : ""}.
              </div>
            )}
            {PROFESSIONS.filter((p) => p.id !== profession.id).map((p) => {
              const qualified = jobRequirementsMet(skills, p.id);
              const chance = qualified ? applicationChance(skills, p.id) : 0;
              const paOk = actionPoints >= JOB_APPLY_PA_COST;
              const canApply = qualified && paOk && cooldownLeft <= 0;
              return (
                <div key={p.id} style={{ ...styles.card, padding: 12, marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: C.ink }}>{p.icon} {p.name}</div>
                    <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, color: C.inkSoft }}>{f(p.salary)}/mois</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                    {Object.entries(p.jobRequirements || {}).map(([key, min]) => {
                      const met = (skills[key] || 0) >= min;
                      return (
                        <span key={key} style={{ fontSize: 10.5, padding: "3px 8px", borderRadius: 999, background: met ? C.good : C.bad, color: "#fff", opacity: met ? 0.85 : 0.9 }}>
                          {SKILL_LABELS[key]} ≥{min}
                        </span>
                      );
                    })}
                  </div>
                  {qualified && <div style={{ fontSize: 10.5, color: C.inkSoft, marginTop: 6 }}>Chance d'acceptation estimée : ~{Math.round(chance * 100)}%</div>}
                  <button
                    style={{ ...styles.smallBtn, width: "100%", boxSizing: "border-box", marginTop: 8, opacity: canApply ? 1 : 0.4 }}
                    disabled={!canApply}
                    onClick={() => onApplyToJob(p.id)}
                  >
                    Postuler (⚡{JOB_APPLY_PA_COST})
                  </button>
                </div>
              );
            })}
          </>
        )}

        {tab === "missions" && (
          <>
            <div style={{ fontSize: 11.5, color: C.inkSoft, marginBottom: 12 }}>
              Missions ponctuelles du jour, payées comptant. Les effectuer a une chance de faire progresser la compétence liée.
            </div>
            {missions.length === 0 && <div style={{ fontSize: 12.5, color: C.inkSoft, fontStyle: "italic" }}>Aucune mission disponible pour l'instant.</div>}
            {missions.map((m) => {
              const canDo = actionPoints >= m.paCost;
              return (
                <div key={m.id} style={{ ...styles.card, padding: 12, marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: C.ink }}>{m.title}</div>
                    <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, color: C.good }}>+{f(m.pay)}</div>
                  </div>
                  <div style={{ fontSize: 10.5, color: C.inkSoft, marginTop: 4 }}>Compétence liée : {SKILL_LABELS[m.skill]}</div>
                  <button
                    style={{ ...styles.primaryBtn, width: "100%", boxSizing: "border-box", marginTop: 8, opacity: canDo ? 1 : 0.4 }}
                    disabled={!canDo}
                    onClick={() => onDoMission(m.id)}
                  >
                    Effectuer (⚡{m.paCost})
                  </button>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
