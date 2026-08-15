import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import type { ProgressMeasurement } from "../types";

interface MeasurementChartProps {
  measurements: ProgressMeasurement[];
}

const WIDTH = 640;
const HEIGHT = 220;
const PADDING = 32;

export function MeasurementChart({ measurements }: MeasurementChartProps) {
  const theme = useTheme();

  if (measurements.length < 2) {
    return (
      <Typography variant="body2" color="text.secondary">
        Se necesitan al menos dos mediciones para mostrar la gráfica de evolución.
      </Typography>
    );
  }

  const sorted = [...measurements].sort(
    (a, b) => new Date(a.measured_on).getTime() - new Date(b.measured_on).getTime(),
  );

  const weights = sorted.map((m) => m.weight_kg);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const range = maxWeight - minWeight || 1;

  const innerWidth = WIDTH - PADDING * 2;
  const innerHeight = HEIGHT - PADDING * 2;

  const points = sorted.map((m, index) => {
    const x = PADDING + (index / (sorted.length - 1)) * innerWidth;
    const y = PADDING + innerHeight - ((m.weight_kg - minWeight) / range) * innerHeight;
    return { x, y, measurement: m };
  });

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <Box sx={{ overflowX: "auto" }}>
      <svg width={WIDTH} height={HEIGHT} role="img" aria-label="Evolución del peso">
        <line
          x1={PADDING}
          y1={HEIGHT - PADDING}
          x2={WIDTH - PADDING}
          y2={HEIGHT - PADDING}
          stroke={theme.palette.divider}
        />
        <line x1={PADDING} y1={PADDING} x2={PADDING} y2={HEIGHT - PADDING} stroke={theme.palette.divider} />

        <text x={4} y={PADDING + 4} fontSize={11} fill={theme.palette.text.secondary}>
          {maxWeight.toFixed(1)} kg
        </text>
        <text x={4} y={HEIGHT - PADDING + 4} fontSize={11} fill={theme.palette.text.secondary}>
          {minWeight.toFixed(1)} kg
        </text>

        <path d={path} fill="none" stroke={theme.palette.primary.main} strokeWidth={2} />

        {points.map((p) => (
          <circle key={p.measurement.progress_measurement_id} cx={p.x} cy={p.y} r={3.5} fill={theme.palette.primary.main} />
        ))}

        <text x={PADDING} y={HEIGHT - 6} fontSize={11} fill={theme.palette.text.secondary}>
          {sorted[0].measured_on}
        </text>
        <text
          x={WIDTH - PADDING}
          y={HEIGHT - 6}
          fontSize={11}
          fill={theme.palette.text.secondary}
          textAnchor="end"
        >
          {sorted[sorted.length - 1].measured_on}
        </text>
      </svg>
    </Box>
  );
}
