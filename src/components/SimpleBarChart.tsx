import { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";

interface BarDatum {
  label: string;
  value: number;
}

interface SimpleBarChartProps {
  bars: BarDatum[];
  color?: string;
  valueFormatter?: (value: number) => string;
  height?: number;
}

const WIDTH = 560;
const PADDING = 32;
const BAR_MAX_WIDTH = 24;

function roundedTopRectPath(x: number, y: number, width: number, height: number, radius: number): string {
  const r = Math.max(0, Math.min(radius, width / 2, height));
  return `M ${x} ${y + height} L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} L ${x + width - r} ${y} Q ${x + width} ${y} ${x + width} ${y + r} L ${x + width} ${y + height} Z`;
}

/**
 * A single-series magnitude-by-category chart: sequential (one hue), no
 * legend needed. The bar itself is the hover hit target (no crosshair,
 * per the dataviz method's bar/cell rule), 4px rounded top / square baseline.
 */
export function SimpleBarChart({ bars, color, valueFormatter, height = 200 }: SimpleBarChartProps) {
  const theme = useTheme();
  const barColor = color ?? theme.palette.primary.main;
  const format = valueFormatter ?? ((v: number) => v.toLocaleString());
  const [hovered, setHovered] = useState<number | null>(null);

  if (bars.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No hay datos para mostrar.
      </Typography>
    );
  }

  const maxValue = Math.max(...bars.map((b) => b.value), 1);
  const innerWidth = WIDTH - PADDING * 2;
  const innerHeight = height - PADDING * 2;
  const bandWidth = innerWidth / bars.length;
  const barWidth = Math.min(BAR_MAX_WIDTH, bandWidth * 0.6);
  const baselineY = PADDING + innerHeight;

  const activeBar = hovered !== null ? bars[hovered] : null;
  const activeX = hovered !== null ? PADDING + hovered * bandWidth + bandWidth / 2 : 0;

  return (
    <Box sx={{ position: "relative", width: "100%", overflowX: "auto" }}>
      <svg width={WIDTH} height={height} role="img" aria-label="Gráfica de barras">
        <line
          x1={PADDING}
          y1={baselineY}
          x2={WIDTH - PADDING}
          y2={baselineY}
          stroke={theme.palette.divider}
          strokeWidth={1}
        />

        {bars.map((bar, i) => {
          const barHeight = Math.max((bar.value / maxValue) * innerHeight, bar.value > 0 ? 2 : 0);
          const x = PADDING + i * bandWidth + (bandWidth - barWidth) / 2;
          const y = baselineY - barHeight;
          return (
            <g key={bar.label}>
              <path
                d={roundedTopRectPath(x, y, barWidth, barHeight, 4)}
                fill={barColor}
                opacity={hovered === null || hovered === i ? 1 : 0.55}
              />
              <rect
                x={x - 4}
                y={PADDING}
                width={barWidth + 8}
                height={innerHeight}
                fill="transparent"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered((current) => (current === i ? null : current))}
                style={{ cursor: "pointer" }}
              />
              <text
                x={x + barWidth / 2}
                y={baselineY + 16}
                fontSize={11}
                textAnchor="middle"
                fill={theme.palette.text.secondary}
              >
                {bar.label}
              </text>
            </g>
          );
        })}
      </svg>

      {activeBar && (
        <Paper
          elevation={3}
          sx={{
            position: "absolute",
            left: Math.min(Math.max(activeX, 60), WIDTH - 60),
            top: 4,
            transform: "translateX(-50%)",
            px: 1.25,
            py: 0.75,
            pointerEvents: "none",
          }}
        >
          <Typography variant="caption" color="text.secondary" display="block">
            {activeBar.label}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {format(activeBar.value)}
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
