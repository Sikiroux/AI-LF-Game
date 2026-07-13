import AssetCard from "./AssetCard.jsx";
import { fmt } from "../../utils/format.js";
import { styles, COLORS, CSS_EXTRA } from "../../styles/theme.js";

export default function AssetsScreen({ assets, cash, currency, onPayOff, onStartAmortization, onCancelAmortization, onBack }) {
  const f = (n) => fmt(n, currency);
  const totalDue = assets.reduce((s, a) => s + (a.loanBalance || 0), 0);
  return (
    <div style={{ ...styles.app, overflowY: "auto", padding: "16px 14px 40px", alignItems: "center", display: "flex", flexDirection: "column" }}>
      <style>{CSS_EXTRA}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", maxWidth: 420, marginBottom: 10 }}>
        <button className="btn-small" style={styles.smallBtn} onClick={onBack}>← Retour</button>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 18, color: COLORS.ink, fontWeight: 700 }}>📁 Mes actifs</div>
        <div style={{ width: 70 }} />
      </div>
      <div style={{ fontSize: 12, color: COLORS.inkSoft, textAlign: "center", marginBottom: 14 }}>
        Liquidités : <b style={{ color: COLORS.ink }}>{f(cash)}</b>{totalDue > 0 && <> · Total dû : <b style={{ color: COLORS.rust }}>{f(totalDue)}</b></>}
      </div>
      {assets.length === 0 && <div style={{ fontSize: 13, color: COLORS.inkSoft, fontStyle: "italic" }}>Aucun actif pour l'instant.</div>}
      <div style={{ width: "100%", maxWidth: 420 }}>
        {assets.map((a) => (
          <AssetCard key={a.id} asset={a} currency={currency} cash={cash} onPayOff={onPayOff} onStartAmortization={onStartAmortization} onCancelAmortization={onCancelAmortization} />
        ))}
      </div>
    </div>
  );
}
