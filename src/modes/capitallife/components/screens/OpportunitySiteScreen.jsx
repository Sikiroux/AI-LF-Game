import { useState } from "react";
import { fmt } from "../../../../utils/format.js";
import { SECTOR_LABELS } from "../../../../data/sectors.js";
import { useCapitalLifeColors, getStyles } from "../../styles/theme.js";
import { ACTION_COSTS } from "../../engine/actionPoints.js";
import { LISTING_BASE, AVAILABLE_LISTING_VARIANTS } from "../../data/imageManifest.js";

const CATEGORIES = {
  realestate: { label: "Immobilier", badge: "immo", file: "immobilier" },
  business: { label: "Entreprise", badge: "biz", file: "entreprise" },
  stock: { label: "Actions", badge: "actions", file: "actions" },
};

const FILTERS = [
  { key: "all", label: "Toutes" },
  { key: "realestate", label: "Immobilier" },
  { key: "business", label: "Entreprises" },
  { key: "stock", label: "Actions" },
];

function photoFile(listing) {
  const cat = CATEGORIES[listing.card.type];
  if (!cat) return null;
  const variants = AVAILABLE_LISTING_VARIANTS[listing.card.type] || [];
  if (variants.length === 0) return null;
  const hash = listing.id.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const variant = variants[hash % variants.length];
  return `${cat.file}-${variant}.png`;
}

export default function OpportunitySiteScreen({ listings, day, cash, currency, actionPoints, onOpen, onInspect, onNegotiate, onBack }) {
  const C = useCapitalLifeColors();
  const styles = getStyles(C);
  const [filter, setFilter] = useState("all");
  const f = (n) => fmt(n, currency);
  const canNegotiate = actionPoints == null || actionPoints >= ACTION_COSTS.buyAsset;
  const canInspect = actionPoints == null || actionPoints >= ACTION_COSTS.inspectListing;
  const canBargain = actionPoints == null || actionPoints >= ACTION_COSTS.negotiateListing;

  const filtered = filter === "all" ? listings : listings.filter((l) => l.card.type === filter);

  return (
    <div style={styles.app}>
      <div style={styles.topBar}>
        <button className="cl-tap" style={styles.backBtn} onClick={onBack}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>🏷️ OppMarket</div>
          <div style={{ fontSize: 10, color: C.inkSoft, marginTop: 1 }}>
            {listings.length} annonce{listings.length > 1 ? "s" : ""} active{listings.length > 1 ? "s" : ""} · liquidités {f(cash)}
            {actionPoints != null && <> · négocier coûte <span style={{ color: canNegotiate ? C.ink : C.bad, fontWeight: 600 }}>⚡{ACTION_COSTS.buyAsset}</span></>}
          </div>
        </div>
      </div>
      {!canNegotiate && (
        <div style={{ flexShrink: 0, padding: "8px 16px", background: C.surfaceRaised, borderBottom: `1px solid ${C.line}` }}>
          <div style={{ ...styles.centerCol, fontSize: 11, color: C.bad, textAlign: "center" }}>
            Plus assez de points d'action aujourd'hui pour négocier un achat — revenez demain.
          </div>
        </div>
      )}

      <div style={{ flexShrink: 0, display: "flex", padding: "10px 16px", overflowX: "auto", borderBottom: `1px solid ${C.line}` }}>
        <div style={{ ...styles.centerCol, display: "flex", gap: 8 }}>
          {FILTERS.map((ft) => (
            <button className="cl-tap" key={ft.key} style={{ ...styles.chip, ...(filter === ft.key ? styles.chipActive : {}) }} onClick={() => setFilter(ft.key)}>
              {ft.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ ...styles.content, padding: "14px 14px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.length === 0 && (
          <div style={{ fontSize: 13, color: C.inkSoft, fontStyle: "italic", textAlign: "center", marginTop: 24 }}>
            Aucune annonce pour l'instant, revenez demain.
          </div>
        )}
        {filtered.map((l) => {
          const daysLeft = l.expiresDay - day;
          const cat = CATEGORIES[l.card.type];
          const apport = l.card.downPayment != null ? l.card.downPayment : l.card.cost;
          const affordable = cash >= apport;
          const knownCashflow = l.card.type === "stock" || l.kind === "jackpot" || l.inspected;
          const displayedCashflow = knownCashflow ? l.card.cashflow : (l.apparentCashflow ?? l.card.cashflow);
          const yieldPct = l.card.cost > 0 ? ((displayedCashflow * 12) / l.card.cost) * 100 : 0;
          const expiryTone = daysLeft <= 1 ? "urgent" : daysLeft <= 3 ? "soon" : "normal";
          const photo = photoFile(l);

          return (
            <div key={l.id} style={{ ...styles.card, padding: 0, overflow: "hidden" }}>
            <button className="cl-tap"
              onClick={() => onOpen(l)}
              style={{ display: "block", width: "100%", textAlign: "left", cursor: "pointer", font: "inherit", color: "inherit", padding: 0, background: "transparent", border: "none" }}
            >
              <div style={{ ...styles.placeholderImg, height: 108, borderRadius: 0, borderLeft: "none", borderRight: "none", borderTop: "none", overflow: "hidden" }}>
                {photo ? (
                  <img src={`${LISTING_BASE}${photo}`} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  "📷"
                )}
                {cat && (
                  <span style={{ position: "absolute", top: 8, left: 8, fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "#fff", padding: "4px 8px", borderRadius: 6, background: C[`cat${cat.badge[0].toUpperCase()}${cat.badge.slice(1)}`] }}>
                    {cat.label}
                  </span>
                )}
                {l.kind === "jackpot" && (
                  <span style={{ position: "absolute", top: 8, right: 8, fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "#fff", background: C.warn, padding: "4px 8px", borderRadius: 6 }}>
                    🌟 Exceptionnelle
                  </span>
                )}
                <span style={{
                  position: "absolute", bottom: 8, right: 8, fontSize: 10.5, fontWeight: 800,
                  color: "#fff", padding: "4px 9px", borderRadius: 999,
                  background: expiryTone === "urgent" ? C.bad : expiryTone === "soon" ? C.warn : "rgba(0,0,0,0.55)",
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  ⏳ {daysLeft}j
                </span>
                {!photo && <span style={{ ...styles.placeholderFile, position: "absolute", bottom: 8 }}>{cat ? `listings/${cat.file}-*.png` : "listings/divers-1.png"}</span>}
              </div>

              <div style={{ padding: "12px 14px 14px" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 2 }}>{l.card.title}</div>
                <div style={{ fontSize: 9.5, color: C.inkSoft, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>
                  {SECTOR_LABELS[l.card.sector] || ""}
                  {l.card.stakePct != null && <> · {l.card.stakePct}% de participation</>}
                </div>
                {l.card.desc && <div style={{ fontSize: 11.5, color: C.inkSoft, lineHeight: 1.4, marginBottom: 10 }}>{l.card.desc}</div>}

                {(l.inspected || l.negotiated) && (
                  <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                    {l.inspected && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 7px", borderRadius: 6, color: "#fff", background: l.flawed ? C.bad : C.good }}>
                        {l.flawed ? "⚠️ Vice caché détecté" : "✓ Inspecté : sain"}
                      </span>
                    )}
                    {l.negotiated && <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 7px", borderRadius: 6, color: "#fff", background: C.accent }}>🤝 Prix négocié</span>}
                  </div>
                )}

                <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 9.5, color: C.inkSoft, textTransform: "uppercase", letterSpacing: "0.04em" }}>Apport</div>
                    <div style={{ ...styles.mono, fontSize: 13.5, fontWeight: 700, marginTop: 1, color: affordable ? C.ink : C.bad }}>{f(apport)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9.5, color: C.inkSoft, textTransform: "uppercase", letterSpacing: "0.04em" }}>Cash-flow{!knownCashflow && " (est.)"}</div>
                    <div style={{ ...styles.mono, fontSize: 13.5, fontWeight: 700, marginTop: 1, color: displayedCashflow >= 0 ? C.good : C.bad }}>
                      {knownCashflow ? "" : "≈ "}{displayedCashflow >= 0 ? "+" : ""}{f(displayedCashflow)}/mois
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9.5, color: C.inkSoft, textTransform: "uppercase", letterSpacing: "0.04em" }}>Rentabilité</div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 1 }}>{yieldPct.toFixed(1)} %{!knownCashflow && " ~"}</div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: `1px solid ${C.line}`, fontSize: 11 }}>
                  <span style={{ color: expiryTone === "urgent" ? C.bad : expiryTone === "soon" ? C.warn : C.inkSoft, fontWeight: expiryTone === "normal" ? 400 : 700 }}>
                    ⏳ Expire dans {daysLeft} jour{daysLeft > 1 ? "s" : ""}
                  </span>
                  {!affordable && <span style={{ color: C.bad, fontWeight: 700 }}>Apport insuffisant</span>}
                </div>
              </div>
            </button>
            {l.card.type !== "stock" && (!l.inspected || !l.negotiated) && (
              <div style={{ display: "flex", gap: 8, padding: "0 14px 14px" }}>
                {!l.inspected && (
                  <button className="cl-tap"
                    style={{ ...styles.smallBtn, flex: 1, opacity: canInspect ? 1 : 0.5 }}
                    disabled={!canInspect}
                    onClick={() => onInspect(l.id)}
                  >
                    🔍 Inspecter · ⚡{ACTION_COSTS.inspectListing}
                  </button>
                )}
                {!l.negotiated && (
                  <button className="cl-tap"
                    style={{ ...styles.smallBtn, flex: 1, opacity: canBargain ? 1 : 0.5 }}
                    disabled={!canBargain}
                    onClick={() => onNegotiate(l.id)}
                  >
                    🤝 Négocier · ⚡{ACTION_COSTS.negotiateListing}
                  </button>
                )}
              </div>
            )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
