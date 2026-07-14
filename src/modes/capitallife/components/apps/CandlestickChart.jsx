export default function CandlestickChart({ history, width, height, C }) {
  const data = history.slice(-20);
  if (data.length < 1) return <svg width={width} height={height} />;
  const allValues = data.flatMap((c) => [c.high, c.low]);
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const range = max - min || 1;
  const n = data.length;
  const candleWidth = width / n;
  const bodyWidth = Math.max(2, candleWidth * 0.55);
  const yFor = (v) => height - ((v - min) / range) * height;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {data.map((c, i) => {
        const x = i * candleWidth + candleWidth / 2;
        const up = c.close >= c.open;
        const col = up ? C.good : C.bad;
        const bodyTop = yFor(Math.max(c.open, c.close));
        const bodyBottom = yFor(Math.min(c.open, c.close));
        const bodyHeight = Math.max(1, bodyBottom - bodyTop);
        return (
          <g key={i}>
            <line x1={x} x2={x} y1={yFor(c.high)} y2={yFor(c.low)} stroke={col} strokeWidth="1" />
            <rect x={x - bodyWidth / 2} y={bodyTop} width={bodyWidth} height={bodyHeight} fill={col} />
          </g>
        );
      })}
    </svg>
  );
}
