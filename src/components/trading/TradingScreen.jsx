import { useState } from "react";
import { fmt } from "../../utils/format.js";
import { SECTOR_LABELS } from "../../data/sectors.js";
import CandlestickChart from "./CandlestickChart.jsx";
import TokenListItem from "./TokenListItem.jsx";
import Row from "../ledger/Row.jsx";
import { styles, COLORS, CSS_EXTRA } from "../../styles/theme.js";

export default function TradingScreen({ tokens, portfolio, journal, cash, currency, marketTurn, traderJournalActive, onToggleTraderJournal, onBuy, onSell, onBack }) {
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
    <div style={{ ...styles.app, overflowY: "auto", padding: "16px 14px 40px" }}>
      <style>{CSS_EXTRA}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <button className="btn-small" style={styles.smallBtn} onClick={onBack}>← Retour</button>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 18, color: COLORS.ink, fontWeight: 700 }}>📈 Bourse</div>
        <div style={{ width: 70 }} />
      </div>
      <div style={{ fontSize: 12, color: COLORS.inkSoft, textAlign: "center", marginBottom: 10 }}>
        Liquidités : <b style={{ color: COLORS.ink }}>{f(cash)}</b> · Portefeuille : <b style={{ color: COLORS.ink }}>{f(portfolioValue)}</b>
      </div>

      <div style={{ ...styles.ledger, marginBottom: 14, textAlign: "center" }}>
        <div style={{ fontSize: 11, color: COLORS.inkSoft }}>
          🎲 Jour {marketTurn} — le marché avance à chaque lancé de dé sur le plateau.
        </div>
        <div style={{ fontSize: 10, color: COLORS.inkSoft, marginTop: 4, fontStyle: "italic" }}>
          Retourne jouer la course infernale pour faire évoluer tes positions.
        </div>
      </div>

      {selected && (
        <div style={styles.ledger}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: 16, color: COLORS.ink }}>{selected.symbol}</div>
              <div style={{ fontSize: 11, color: COLORS.inkSoft }}>{selected.name} · {SECTOR_LABELS[selected.sector]}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: 17, color: COLORS.ink }}>{f(selected.price)}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: selected.lastChangePct >= 0 ? COLORS.teal : COLORS.rust }}>
                {selected.lastChangePct >= 0 ? "▲" : "▼"} {(Math.abs(selected.lastChangePct) * 100).toFixed(1)}% aujourd'hui
              </div>
            </div>
          </div>
          <div style={{ marginTop: 10, display: "flex", justifyContent: "center" }}>
            <CandlestickChart history={selected.history} width={290} height={120} />
          </div>
          {owned > 0 && (
            <div style={{ ...styles.exitBar, marginTop: 10 }}>
              <Row label="Détenu" value={`${owned} × ${f(selected.price)} = ${f(owned * selected.price)}`} bold />
              {avgCost != null ? (
                <>
                  <Row label="Prix d'achat moyen" value={f(avgCost)} />
                  <Row label="Gain/perte depuis l'achat" value={`${gainAbs >= 0 ? "+" : ""}${f(gainAbs)} (${gainPct >= 0 ? "+" : ""}${gainPct.toFixed(1)}%)`} bold negative={gainAbs < 0} />
                </>
              ) : (
                <div style={{ fontSize: 11, color: COLORS.inkSoft, fontStyle: "italic" }}>Prix d'achat d'une ancienne partie non disponible.</div>
              )}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
            <input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} style={{ ...styles.formInputSmall, width: 56 }} />
            <button className="btn-primary" style={{ ...styles.primaryBtn, flex: 1, padding: "9px 10px", opacity: maxAfford <= 0 ? 0.4 : 1 }} disabled={maxAfford <= 0} onClick={() => onBuy(selected.symbol, qty)}>Acheter</button>
            <button className="btn-small" style={{ ...styles.smallBtn, flex: 1 }} disabled={owned <= 0} onClick={() => onSell(selected.symbol, qty)}>Vendre</button>
          </div>
        </div>
      )}

      <div style={{ ...styles.sectionLabel, marginTop: 18 }}>Tous les tokens ({tokens.length})</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 6 }}>
        {tokens.map((t) => (
          <TokenListItem key={t.symbol} token={t} position={portfolio[t.symbol] || null} active={selected && t.symbol === selected.symbol} onSelect={() => setSelectedSymbol(t.symbol)} />
        ))}
      </div>

      <div style={{ ...styles.sectionLabel, marginTop: 22 }}>Journal des Traders</div>
      <div style={{ ...styles.ledger, marginBottom: 4 }}>
        <div style={{ fontSize: 12, color: COLORS.inkSoft, marginBottom: 8 }}>
          Abonnement payant : gros titres sur ce que pensent les traders du moment — souvent juste, parfois faux.
        </div>
        <button
          className={traderJournalActive ? "btn-small" : "btn-primary"}
          style={traderJournalActive ? { ...styles.smallBtnDanger, width: "100%", boxSizing: "border-box" } : { ...styles.primaryBtn, width: "100%", boxSizing: "border-box" }}
          onClick={onToggleTraderJournal}
        >
          {traderJournalActive ? `Résilier l'abonnement (${f(journalCost)}/tour)` : `S'abonner (${f(journalCost)}/tour)`}
        </button>
      </div>

      <div style={{ ...styles.sectionLabel, marginTop: 18 }}>Journal des marchés</div>
      {journal.length === 0 && <div style={{ fontSize: 12, color: COLORS.inkSoft, fontStyle: "italic" }}>Rien à signaler pour l'instant.</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {journal.map((n) => (
          <button key={n.id} className="btn-small" style={{ ...styles.journalItem, textAlign: "left", ...(n.sentiment ? { borderStyle: "solid", borderColor: COLORS.plum } : {}) }} onClick={() => setExpandedNews(expandedNews === n.id ? null : n.id)}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <span style={{ fontSize: 12, color: COLORS.ink, fontWeight: 700 }}>{n.sentiment ? "🗞️ " : ""}{n.title}</span>
              {!n.sentiment && <span style={{ fontSize: 11, color: n.effect >= 0 ? COLORS.teal : COLORS.rust, fontWeight: 700, whiteSpace: "nowrap" }}>{n.token || "Marché"} {n.effect >= 0 ? "+" : ""}{(n.effect * 100).toFixed(1)}%</span>}
            </div>
            {expandedNews === n.id && <div style={{ fontSize: 11, color: COLORS.inkSoft, marginTop: 4 }}>{n.detail} (tour {n.turn})</div>}
          </button>
        ))}
      </div>
    </div>
  );
}
