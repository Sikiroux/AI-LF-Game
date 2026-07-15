import { fmt } from "../../../../utils/format.js";
import { useCapitalLifeColors, getStyles } from "../../styles/theme.js";
import AssetCard from "./AssetCard.jsx";

export default function AssetsScreen({ assets, cash, currency, onPayOff, onPayOffAll, onStartAmortization, onCancelAmortization, onSelect, onBack }) {
  const C = useCapitalLifeColors();
  const styles = getStyles(C);
  const f = (n) => fmt(n, currency);
  const totalDue = assets.reduce((s, a) => s + (a.loanBalance || 0), 0);
  const loanedAssets = assets.filter((a) => a.loanBalance > 0);
  const payableCount = loanedAssets.filter((a) => a.loanBalance <= cash).length;

  return (
    <div style={styles.app}>
      <div style={styles.topBar}>
        <button className="cl-tap" style={styles.backBtn} onClick={onBack}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>📁 Mes actifs</div>
          <div style={{ fontSize: 10, color: C.inkSoft, marginTop: 1 }}>
            Liquidités {f(cash)}{totalDue > 0 && <> · {f(totalDue)} dû</>}
          </div>
        </div>
      </div>

      <div style={{ ...styles.content, padding: 16 }}>
        {loanedAssets.length > 1 && (
          <div style={{ marginBottom: 14 }}>
            <button className="cl-tap"
              style={{ ...styles.primaryBtn, width: "100%", boxSizing: "border-box", opacity: payableCount > 0 ? 1 : 0.4 }}
              disabled={payableCount === 0}
              onClick={onPayOffAll}
            >
              Tout rembourser d'un coup ({payableCount}/{loanedAssets.length} solde{payableCount > 1 ? "s" : ""})
            </button>
            <div style={{ fontSize: 10, color: C.inkSoft, textAlign: "center", marginTop: 4 }}>Solde les prêts les plus petits en premier, dans la limite de vos liquidités.</div>
          </div>
        )}
        {assets.length === 0 && <div style={{ fontSize: 13, color: C.inkSoft, fontStyle: "italic", textAlign: "center", marginTop: 24 }}>Aucun actif pour l'instant.</div>}
        {assets.map((a) => (
          <AssetCard key={a.id} asset={a} currency={currency} cash={cash} onPayOff={onPayOff} onStartAmortization={onStartAmortization} onCancelAmortization={onCancelAmortization} onSelect={onSelect} C={C} styles={styles} />
        ))}
      </div>
    </div>
  );
}
