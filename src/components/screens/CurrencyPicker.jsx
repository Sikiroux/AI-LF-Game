import { CURRENCIES } from "../../data/currencies.js";
import { styles } from "../../styles/theme.js";

export default function CurrencyPicker({ currency, onCycle, compact }) {
  const cfg = CURRENCIES[currency];
  return (
    <button className="stamp-btn" style={compact ? styles.currencyBadge : styles.currencyBadgeLarge} onClick={onCycle} title="Changer de devise">
      <span style={{ fontWeight: 700 }}>{cfg.symbol}</span>
      {!compact && <span style={{ fontSize: 10, marginTop: 1, opacity: 0.75 }}>{currency}</span>}
    </button>
  );
}
