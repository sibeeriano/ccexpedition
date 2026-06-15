export const CATEGORY_CHART_COLORS = [
  "#03b1b5",
  "#ffa549",
  "#6366f1",
  "#a855f7",
  "#22c55e",
  "#f43f5e",
  "#eab308",
  "#38bdf8",
  "#94a3b8",
] as const;

export type PieSlice = {
  key: string;
  label: string;
  value: number;
  percent: number;
  color: string;
};

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleRad: number,
): { x: number; y: number } {
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
}

function describeSlice(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = polarToCartesian(cx, cy, radius, startAngle);
  const end = polarToCartesian(cx, cy, radius, endAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

type CategoryPieChartProps = {
  slices: PieSlice[];
  size?: number;
};

export function CategoryPieChart({ slices, size = 220 }: CategoryPieChartProps) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 8;

  if (total <= 0 || slices.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-full border border-dashed border-white/15 bg-white/[0.02]"
        style={{ width: size, height: size }}
      >
        <div className="h-12 w-12 rounded-full bg-white/5" />
      </div>
    );
  }

  if (slices.length === 1) {
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-hidden
        className="shrink-0"
      >
        <circle cx={cx} cy={cy} r={radius} fill={slices[0].color} />
      </svg>
    );
  }

  let startAngle = -Math.PI / 2;
  const paths = slices.map((slice) => {
    const sweep = (slice.value / total) * Math.PI * 2;
    const endAngle = startAngle + sweep;
    const path = describeSlice(cx, cy, radius, startAngle, endAngle);
    startAngle = endAngle;
    return { ...slice, path };
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-hidden
      className="shrink-0"
    >
      {paths.map((slice) => (
        <path
          key={slice.key}
          d={slice.path}
          fill={slice.color}
          stroke="var(--color-surface)"
          strokeWidth={2}
        />
      ))}
    </svg>
  );
}

export function colorForCategoryIndex(index: number): string {
  return CATEGORY_CHART_COLORS[index % CATEGORY_CHART_COLORS.length];
}
