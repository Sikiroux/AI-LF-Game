import { useState } from "react";
import { fmt } from "../../../../utils/format.js";
import { SECTOR_LABELS } from "../../../../data/sectors.js";
import { useCapitalLifeColors, getStyles } from "../../styles/theme.js";
import CandlestickChart from "./CandlestickChart.jsx";
import TokenListItem from "./TokenListItem.jsx";

function Row({ label, value, bold, tone, C }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "4px 0" }}>
      <span style={{ color: bold ? C.ink : C.inkSoft, fontWeight: bold ? 700 : 400 }}>{label}</span>
      <span style={{ fontFamily: "ui-monospace, monospace", fontVariantNumeric: "tabular-nums", fontWeight: bold ? 700 : 400, color: tone === "good" ? C.good : tone === "bad" ? C.bad : C.ink }}>{value}</span>
    </div>
  );
}

export default function TradingScreen({ tokens, portfolio, journal, cash, currency, marketTurn, traderJournalActive, onToggleTraderJournal, onBuy, onSell, onBack, advanceHint, advanceSubHint }) {
  const C = useCapitalLifeColors();
  const styles = getStyles(C);
  const [selectedSymbol, setSelectedSymbol] = useState(tokens[0] ? tokens[0].symbol : null);
  const [qty, setQty] = useState(1);
  const [expandedNews, setExpandedNews] = useState(null);
  const f = (n) => fmt(n, currency);
  const portfolioValue = tokens.reduce((s, t) => s + ((portfolio[t.symbol]?.shares) || 0) * t.price, 0);
  const selected = tokens.find((t) => t.symbol === selectedSymbol) || tokens[0];
  const ownedPos = selected ? portfolio[selected.symbol] : null;
  const owned = ownedPos ? ownedPos.shares : 0;
  const avgCost = ownedPos ? ownedPos.avgCost : null;
  const gainPct = owned > 0 && avgCost ? ((selected.price - avgCost) / avgCost) * 100 : null;
  const gainAbs = owned > 0 && avgCost ? (selected.price - avgCost) * owned : null;
  const maxAfford = selected ? Math.max(0, Math.floor(cash / selected.price)) : 0;
  const journalCost = Math.max(10, Math.round(tokens.length * 2));

  return (
    <div style={styles.app}>
      <div style={styles.topBar}>
        <button className="cl-tap" style={styles.backBtn} onClick={onBack}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>📈 Bourse</div>
          <div style={{ fontSize: 10, color: C.inkSoft, marginTop: 1 }}>Liquidités {f(cash)} · Portefeuille {f(portfolioValue)}</div>
        </div>
      </div>

      <div style={{ ...styles.content, padding: 16 }}>
        <div style={{ ...styles.card, padding: "10px 14px", textAlign: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: C.inkSoft }}>🎲 Jour {marketTurn} — {advanceHint || "le marché avance à chaque jour qui passe."}</div>
          <div style={{ fontSize: 10, color: C.inkSoft, marginTop: 4, fontStyle: "italic" }}>{advanceSubHint || "Retourne à l'accueil et avance d'un jour pour faire évoluer tes positions."}</div>
        </div>

        {selected && (
          <div style={{ ...styles.card, padding: 14, marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ ...styles.mono, fontWeight: 700, fontSize: 16, color: C.ink }}>{selected.symbol}</div>
                <div style={{ fontSize: 11, color: C.inkSoft }}>{selected.name} · {SECTOR_LABELS[selected.sector]}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ ...styles.mono, fontWeight: 700, fontSize: 17, color: C.ink }}>{f(selected.price)}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: selected.lastChangePct >= 0 ? C.good : C.bad }}>
                  {selected.lastChangePct >= 0 ? "▲" : "▼"} {(Math.abs(selected.lastChangePct) * 100).toFixed(1)}% aujourd'hui
                </div>
              </div>
            </div>
            <div style={{ marginTop: 10, display: "flex", justifyContent: "center" }}>
              <CandlestickChart history={selected.history} width={290} height={120} C={C} />
            </div>
            {owned > 0 && (
              <div style={{ marginTop: 10, borderTop: `1px solid ${C.line}`, paddingTop: 8 }}>
                <Row C={C} label="Détenu" value={`${owned} × ${f(selected.price)} = ${f(owned * selected.price)}`} bold />
                {avgCost != null ? (
                  <>
                    <Row C={C} label="Prix d'achat moyen" value={f(avgCost)} />
                    <Row C={C} label="Gain/perte depuis l'achat" value={`${gainAbs >= 0 ? "+" : ""}${f(gainAbs)} (${gainPct >= 0 ? "+" : ""}${gainPct.toFixed(1)}%)`} bold tone={gainAbs < 0 ? "bad" : "good"} />
                  </>
                ) : (
                  <div style={{ fontSize: 11, color: C.inkSoft, fontStyle: "italic" }}>Prix d'achat d'une ancienne partie non disponible.</div>
                )}
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
              <input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} style={{ ...styles.formInput, width: 56 }} />
              <button className="cl-tap" style={{ ...styles.primaryBtn, flex: 1, padding: "9px 10px", opacity: maxAfford <= 0 ? 0.4 : 1 }} disabled={maxAfford <= 0} onClick={() => onBuy(selected.symbol, qty)}>Acheter</button>
              <button className="cl-tap" style={{ ...styles.smallBtn, flex: 1, opacity: owned > 0 ? 1 : 0.4 }} disabled={owned <= 0} onClick={() => onSell(selected.symbol, qty)}>Vendre</button>
            </div>
          </div>
        )}

        <div style={styles.sectionTitle}>Tous les tokens ({tokens.length})</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 6, marginBottom: 18 }}>
          {tokens.map((t) => (
            <TokenListItem key={t.symbol} token={t} position={portfolio[t.symbol] || null} active={selected && t.symbol === selected.symbol} onSelect={() => setSelectedSymbol(t.symbol)} C={C} styles={styles} />
          ))}
        </div>

        <div style={styles.sectionTitle}>Journal des traders</div>
        <div style={{ ...styles.card, padding: 14, marginBottom: 18 }}>
          <div style={{ fontSize: 12, color: C.inkSoft, marginBottom: 8 }}>
            Abonnement payant : gros titres sur ce que pensent les traders du moment — souvent juste, parfois faux.
          </div>
          <button className="cl-tap"
            style={traderJournalActive ? { ...styles.dangerBtn, width: "100%", boxSizing: "border-box" } : { ...styles.primaryBtn, width: "100%", boxSizing: "border-box" }}
            onClick={onToggleTraderJournal}
          >
            {traderJournalActive ? `Résilier l'abonnement (${f(journalCost)}/tour)` : `S'abonner (${f(journalCost)}/tour)`}
          </button>
        </div>

        <div style={styles.sectionTitle}>Journal des marchés</div>
        {journal.length === 0 && <div style={{ fontSize: 12, color: C.inkSoft, fontStyle: "italic" }}>Rien à signaler pour l'instant.</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {journal.map((n) => (
            <button className="cl-tap"
              key={n.id}
              onClick={() => setExpandedNews(expandedNews === n.id ? null : n.id)}
              style={{ ...styles.card, textAlign: "left", cursor: "pointer", font: "inherit", color: "inherit", padding: "8px 10px", ...(n.sentiment ? { borderColor: C.catEncheres } : {}) }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontSize: 12, color: C.ink, fontWeight: 700 }}>{n.sentiment ? "🗞️ " : ""}{n.title}</span>
                {!n.sentiment && <span style={{ fontSize: 11, color: n.effect >= 0 ? C.good : C.bad, fontWeight: 700, whiteSpace: "nowrap" }}>{n.token || "Marché"} {n.effect >= 0 ? "+" : ""}{(n.effect * 100).toFixed(1)}%</span>}
              </div>
              {expandedNews === n.id && <div style={{ fontSize: 11, color: C.inkSoft, marginTop: 4 }}>{n.detail} (jour {n.turn})</div>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
