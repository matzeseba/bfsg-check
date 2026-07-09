/** Inline-SVG-Sparkline (kein Chart-Lib). Signalgelb, brutalistisch. */
export function Sparkline({
  values,
  width = 260,
  height = 56,
  ariaLabel = "Verlauf",
}: {
  values: number[];
  width?: number;
  height?: number;
  ariaLabel?: string;
}) {
  if (!values.length) {
    return (
      <div className="micro" style={{ color: "var(--muted)" }}>
        keine Daten
      </div>
    );
  }
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const pad = 3;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const step = values.length > 1 ? w / (values.length - 1) : 0;

  const points = values.map((v, idx) => {
    const x = pad + idx * step;
    const y = pad + h - ((v - min) / range) * h;
    return [x, y] as const;
  });

  const line = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area =
    `${pad},${pad + h} ` +
    points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ") +
    ` ${pad + w},${pad + h}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel}
      style={{ display: "block" }}
    >
      <polygon points={area} fill="var(--accent)" opacity={0.12} />
      <polyline
        points={line}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
