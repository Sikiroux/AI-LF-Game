import { useState } from "react";
import { PROFESSIONS } from "../../data/professions.js";
import { calcExpenses } from "../../engine/financing.js";
import { fmt } from "../../utils/format.js";
import DreamPickScreen from "./DreamPickScreen.jsx";
import ProfessionConfigScreen from "./ProfessionConfigScreen.jsx";
import { CURRENCIES, CURRENCY_ORDER } from "../../data/currencies.js";
import { styles, COLORS, CSS_EXTRA } from "../../styles/theme.js";

export default function SetupScreen({ onStart, currency, onSelectCurrency, onBack, customJobs, onCreateJob, onDeleteJob }) {
  const [configuring, setConfiguring] = useState(null); // profession en cours de configuration
  const [pendingStart, setPendingStart] = useState(null); // { profession, kids } en attente du choix du rêve

  if (pendingStart) {
    return (
      <DreamPickScreen
        currency={currency}
        onBack={() => setPendingStart(null)}
        onChoose={(chosenDream) => onStart(pendingStart.profession, pendingStart.kids, chosenDream)}
      />
    );
  }

  if (configuring) {
    return <ProfessionConfigScreen profession={configuring} currency={currency} onBack={() => setConfiguring(null)} onConfirm={(prof, kids) => setPendingStart({ profession: prof, kids })} />;
  }

  return (
    <div style={{ ...styles.app, overflowX: "hidden", overflowY: "auto", padding: "26px 18px 40px", width: "100%", minWidth: 0, boxSizing: "border-box" }}>
      <style>{CSS_EXTRA}</style>
      <button className="btn-small" style={{ ...styles.smallBtn, marginBottom: 16 }} onClick={onBack}>← Menu</button>
      <div style={{ textAlign: "center", marginBottom: 20, width: "100%", boxSizing: "border-box" }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: COLORS.inkSoft, textTransform: "uppercase" }}>Le jeu de la</div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 32, color: COLORS.ink, fontWeight: 700, letterSpacing: 0.5 }}>Liberté Financière</div>
        <div style={{ color: COLORS.inkSoft, fontSize: 13, marginTop: 6, maxWidth: 320, marginLeft: "auto", marginRight: "auto" }}>Échappez à la course infernale, tamponnez votre route vers les revenus passifs.</div>
      </div>

      <div style={styles.sectionLabel}>Devise</div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 6 }}>
        {CURRENCY_ORDER.map((code) => (
          <button key={code} className="chip-btn" style={{ ...styles.currencyChip, ...(currency === code ? styles.currencyChipActive : {}) }} onClick={() => onSelectCurrency(code)}>
            <span style={{ fontWeight: 700 }}>{CURRENCIES[code].symbol}</span> {CURRENCIES[code].label}
          </button>
        ))}
      </div>
      <div style={{ textAlign: "center", fontSize: 10, color: COLORS.inkSoft, marginBottom: 22 }}>Montants calculés en euros, convertis au taux actuel.</div>

      <div style={styles.sectionLabel}>Choisissez votre profession</div>
      <div style={{ textAlign: "center", fontSize: 10, color: COLORS.inkSoft, marginTop: -6, marginBottom: 14 }}>Vous pourrez ajuster les charges et le nombre d'enfants juste après.</div>
      <div style={styles.profGrid}>
        {PROFESSIONS.map((p) => {
          const exp = calcExpenses(p, 0, 0);
          return (
            <button key={p.id} className="prof-card" style={styles.profCard} onClick={() => setConfiguring(p)}>
              <div style={{ fontSize: 24 }}>{p.icon}</div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 14, color: COLORS.ink, marginTop: 4, fontWeight: 700 }}>{p.name}</div>
              <div style={{ fontSize: 11, color: COLORS.teal, marginTop: 6, fontFamily: "'Courier New', monospace", fontWeight: 700 }}>
                Salaire {fmt(p.salary, currency)}
              </div>
              <div style={{ fontSize: 11, color: COLORS.inkSoft, fontFamily: "'Courier New', monospace" }}>
                Dépenses {fmt(exp, currency)}
              </div>
            </button>
          );
        })}
        {customJobs.map((p) => {
          const exp = calcExpenses(p, 0, 0);
          return (
            <div key={p.id} style={{ position: "relative" }}>
              <button className="prof-card" style={{ ...styles.profCard, borderStyle: "solid" }} onClick={() => setConfiguring(p)}>
                <div style={{ fontSize: 24 }}>{p.icon}</div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 14, color: COLORS.ink, marginTop: 4, fontWeight: 700 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: COLORS.teal, marginTop: 6, fontFamily: "'Courier New', monospace", fontWeight: 700 }}>
                  Salaire {fmt(p.salary, currency)}
                </div>
                <div style={{ fontSize: 11, color: COLORS.inkSoft, fontFamily: "'Courier New', monospace" }}>
                  Dépenses {fmt(exp, currency)}
                </div>
              </button>
              <button className="btn-small" style={styles.deleteBadge} onClick={(e) => { e.stopPropagation(); onDeleteJob(p.id); }} title="Supprimer ce métier">✕</button>
            </div>
          );
        })}
        <button className="prof-card" style={{ ...styles.profCard, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: COLORS.inkSoft }} onClick={onCreateJob}>
          <div style={{ fontSize: 24 }}>➕</div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 13, marginTop: 4, fontWeight: 700 }}>Créer un métier</div>
        </button>
      </div>
    </div>
  );
}
