import { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";

interface TrendPoint {
  label: string;
  value: number;
}

interface TrendLineChartProps {
  points: TrendPoint[];
  color?: string;
  valueFormatter?: (value: number) => string;
  height?: number;
}

const WIDTH = 560;
const PADDING = 32;

/**
 * A single-series magnitude-over-time chart: sequential (one hue), no legend
 * needed since there's only one series — the card title already names it.
 * Hover shows a tooltip per point; the point's own enlarged hit circle is the
 * target, matching the "mark is the hit target" rule for point/bar charts.
 */
export function TrendLineChart({ points, color, valueFormatter, height = 200 }: TrendLineChartProps) {
  const theme = useTheme();
  const lineColor = color ?? theme.palette.primary.main;
  const format = valueFormatter ?? ((v: number) => v.toLocaleString());
  const [hovered, setHovered] = useState<number | null>(null);

  if (points.length < 2) {
    return (
      <Typography variant="body2" color="text.secondary">
        No hay suficientes datos para mostrar la tendencia.
      </Typography>
    );
  }

  const values = points.map((p) => p.value);
  const minValue = Math.min(0, ...values);
  const maxValue = Math.max(...values) || 1;
  const range = maxValue - minValue || 1;

  const innerWidth = WIDTH - PADDING * 2;
  const innerHeight = height - PADDING * 2;

  const coords = points.map((p, i) => ({
    x: PADDING + (i / (points.length - 1)) * innerWidth,
    y: PADDING + innerHeight - ((p.value - minValue) / range) * innerHeight,
    point: p,
  }));

  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
  const baselineY = PADDING + innerHeight;
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${baselineY} L ${coords[0].x} ${baselineY} Z`;

  const activePoint = hovered !== null ? coords[hovered] : null;

  return (
    <Box sx={{ position: "relative", width: "100%", overflowX: "auto" }}>
      <svg width={WIDTH} height={height} role="img" aria-label="Gráfica de tendencia">
        <line
          x1={PADDING}
          y1={baselineY}
          x2={WIDTH - PADDING}
          y2={baselineY}
          stroke={theme.palette.divider}
          strokeWidth={1}
        />

        <path d={areaPath} fill={lineColor} opacity={0.1} stroke="none" />
        <path
          d={linePath}
          fill="none"
          stroke={lineColor}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {coords.map((c, i) => (
          <g key={i}>
            <circle
              cx={c.x}
              cy={c.y}
              r={4}
              fill={lineColor}
              stroke={theme.palette.background.paper}
              strokeWidth={2}
            />
            <circle
              cx={c.x}
              cy={c.y}
              r={14}
              fill="transparent"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered((current) => (current === i ? null : current))}
              style={{ cursor: "pointer" }}
            />
          </g>
        ))}

        <text x={coords[0].x} y={height - 6} fontSize={11} fill={theme.palette.text.secondary}>
          {coords[0].point.label}
        </text>
        <text
          x={coords[coords.length - 1].x}
          y={height - 6}
          fontSize={11}
          fill={theme.palette.text.secondary}
          textAnchor="end"
        >
          {coords[coords.length - 1].point.label}
        </text>
      </svg>

      {activePoint && (
        <Paper
          elevation={3}
          sx={{
            position: "absolute",
            left: Math.min(Math.max(activePoint.x, 60), WIDTH - 60),
            top: Math.max(activePoint.y - 52, 0),
            transform: "translateX(-50%)",
            px: 1.25,
            py: 0.75,
            pointerEvents: "none",
          }}
        >
          <Typography variant="caption" color="text.secondary" display="block">
            {activePoint.point.label}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {format(activePoint.point.value)}
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
