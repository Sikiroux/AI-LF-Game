import { RAT_RACE_SEQUENCE } from "../../engine/ratRace.js";
import StampCell from "./StampCell.jsx";
import DiceZone from "./DiceZone.jsx";
import { COLORS, styles } from "../../styles/theme.js";

export default function RatBoard({ position, dice, diceRolling, onRoll, skipTurns, charityTurnsLeft, isDesktop, pending, moving, locked, lockedLabel, onEndTurn, endTurnReady }) {
  const size = RAT_RACE_SEQUENCE.length;
  const perSide = size / 4;
  const cellsPerRow = perSide + 1;

  const gridPos = (i) => {
    if (i <= perSide) return { row: 1, col: i + 1 };
    if (i <= perSide * 2) return { row: i - perSide + 1, col: cellsPerRow };
    if (i <= perSide * 3) return { row: cellsPerRow, col: cellsPerRow - (i - perSide * 2) };
    return { row: cellsPerRow - (i - perSide * 3), col: 1 };
  };

  const cellSize = isDesktop ? 62 : 40;

  return (
    <div style={styles.boardWrap}>
      <div style={{ ...styles.ring, gridTemplateColumns: `repeat(${cellsPerRow}, ${cellSize}px)`, gridTemplateRows: `repeat(${cellsPerRow}, ${cellSize}px)` }}>
        {RAT_RACE_SEQUENCE.map((type, i) => {
          const { row, col } = gridPos(i);
          const active = i === position;
          return (
            <div key={i} style={{ gridRow: row, gridColumn: col }}>
              <StampCell type={type} active={active} size={cellSize} isDesktop={isDesktop} hop={active && moving} />
            </div>
          );
        })}
        <div style={{ gridRow: `2 / ${cellsPerRow}`, gridColumn: `2 / ${cellsPerRow}`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", border: `1px dashed ${COLORS.inkSoft}`, borderRadius: 4, opacity: 0.8 }}>
          <div style={{ fontFamily: "Georgia, serif", color: COLORS.ink, fontSize: isDesktop ? 14 : 10, textAlign: "center", textTransform: "uppercase", letterSpacing: 1 }}>Course<br/>infernale</div>
        </div>
      </div>
      <DiceZone dice={dice} diceRolling={diceRolling} onRoll={onRoll} skipTurns={skipTurns} extra={charityTurnsLeft > 0 ? `2 dés actifs — ${charityTurnsLeft} tour(s)` : null} pending={pending} moving={moving} locked={locked} lockedLabel={lockedLabel} onEndTurn={onEndTurn} endTurnReady={endTurnReady} />
    </div>
  );
}
