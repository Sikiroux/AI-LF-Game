import { styles } from "../../styles/theme.js";

export default function Die({ value, rolling, tiltDir }) {
  const PIPS = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };
  const active = PIPS[value] || [4];
  return (
    <div className={rolling ? "dice-rolling" : ""} style={{ ...styles.die, transform: rolling ? "none" : `rotate(${tiltDir}deg)` }}>
      <div style={styles.diePipGrid}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} style={{ ...styles.pip, opacity: active.includes(i) ? 1 : 0 }} />
        ))}
      </div>
    </div>
  );
}
