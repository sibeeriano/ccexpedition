import { useState } from "react";
import { useTranslation } from "react-i18next";

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
  formattedValue: string;
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

type SlicePath = PieSlice & { path: string };

function buildSlicePaths(
  slices: PieSlice[],
  cx: number,
  cy: number,
  radius: number,
  total: number,
): SlicePath[] {
  let startAngle = -Math.PI / 2;
  return slices.map((slice) => {
    const sweep = (slice.value / total) * Math.PI * 2;
    const endAngle = startAngle + sweep;
    const path = describeSlice(cx, cy, radius, startAngle, endAngle);
    startAngle = endAngle;
    return { ...slice, path };
  });
}

type CategoryPieChartProps = {
  slices: PieSlice[];
  size?: number;
};

export function CategoryPieChart({ slices, size = 260 }: CategoryPieChartProps) {
  const { t } = useTranslation();
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 10;
  const activeSlice =
    slices.find((slice) => slice.key === activeKey) ?? null;

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

  const paths =
    slices.length === 1
      ? [{ ...slices[0], path: "" }]
      : buildSlicePaths(slices, cx, cy, radius, total);

  function handleSliceEnter(key: string) {
    setActiveKey(key);
  }

  function handleSliceLeave() {
    setActiveKey(null);
  }

  function toggleSlice(key: string) {
    setActiveKey((current) => (current === key ? null : key));
  }

  return (
    <div
      className="relative mx-auto shrink-0"
      style={{ width: size, height: size }}
      onMouseLeave={handleSliceLeave}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={t("dashboard.chartAria")}
        className="block"
      >
        {slices.length === 1 ? (
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill={slices[0].color}
            className="cursor-pointer transition-[filter] duration-150 hover:brightness-110"
            onMouseEnter={() => handleSliceEnter(slices[0].key)}
            onClick={() => toggleSlice(slices[0].key)}
          />
        ) : (
          paths.map((slice) => {
            const dimmed = activeKey !== null && activeKey !== slice.key;
            return (
              <path
                key={slice.key}
                d={slice.path}
                fill={slice.color}
                stroke="var(--color-surface)"
                strokeWidth={2}
                className={`cursor-pointer transition-[opacity,filter] duration-150 hover:brightness-110 ${
                  dimmed ? "opacity-45" : "opacity-100"
                }`}
                onMouseEnter={() => handleSliceEnter(slice.key)}
                onClick={() => toggleSlice(slice.key)}
              />
            );
          })
        )}
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-10 text-center">
        {activeSlice ? (
          <>
            <span
              className="mb-1.5 inline-block size-2.5 rounded-full"
              style={{ backgroundColor: activeSlice.color }}
              aria-hidden
            />
            <span className="max-w-full truncate text-xs font-medium text-zinc-300">
              {activeSlice.label}
            </span>
            <span className="mt-1 text-lg font-bold leading-tight text-white sm:text-xl">
              {activeSlice.formattedValue}
            </span>
            <span className="mt-0.5 text-xs text-zinc-500">
              {t("dashboard.share", {
                percent: Math.round(activeSlice.percent * 100),
              })}
            </span>
          </>
        ) : (
          <span className="max-w-[9rem] text-xs leading-relaxed text-zinc-500">
            {t("dashboard.chartHint")}
          </span>
        )}
      </div>
    </div>
  );
}

export function colorForCategoryIndex(index: number): string {
  return CATEGORY_CHART_COLORS[index % CATEGORY_CHART_COLORS.length];
}
