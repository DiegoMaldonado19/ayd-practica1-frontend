import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  CircularProgress,
  TextField,
  Autocomplete,
  Stack,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useTrainer, useUpdateTrainerLoad, useReplaceSpecialties } from "@/modules/trainers/hooks";
import type { Specialty, Trainer } from "@/modules/trainers/types";

const ALL_SPECIALTIES: Specialty[] = ["WEIGHT_LOSS", "MUSCLE_GAIN", "REHABILITATION", "FUNCTIONAL", "CARDIO"];

const specialtyLabel: Record<Specialty, string> = {
  WEIGHT_LOSS: "Pérdida de peso",
  MUSCLE_GAIN: "Ganancia muscular",
  REHABILITATION: "Rehabilitación",
  FUNCTIONAL: "Funcional",
  CARDIO: "Cardio",
};

// 1. COMPONENTE CONTENEDOR: Solo maneja la petición y los estados de carga
export function TrainerDetailPage() {
  const { trainerId } = useParams();
  const { data: trainer, isLoading, isError } = useTrainer(Number(trainerId));

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !trainer) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">No se pudo cargar el entrenador.</Typography>
      </Box>
    );
  }

  // Cuando ya tenemos los datos seguros, montamos el contenido
  return <TrainerDetailContent trainer={trainer} trainerId={Number(trainerId)} />;
}

// 2. COMPONENTE DE CONTENIDO: Inicializa sus estados directamente (sin useEffect)
// Nota: Puedes tipar 'trainer' con la interfaz correcta si la tienes exportada (ej. trainer: Trainer)
function TrainerDetailContent({ trainer, trainerId }: { trainer: Trainer; trainerId: number }) {
  const navigate = useNavigate();
  const updateLoad = useUpdateTrainerLoad(trainerId);
  const replaceSpecialties = useReplaceSpecialties(trainerId);

  // Inicialización directa: Al montarse este componente, 'trainer' ya trae datos
  const [maxLoad, setMaxLoad] = useState<number>(trainer.max_member_load);
  const [bio, setBio] = useState<string>(trainer.bio || "");
  const [specialties, setSpecialties] = useState<Specialty[]>(trainer.specialties);

  const loadChanged = maxLoad !== trainer.max_member_load;
  const bioChanged = bio !== (trainer.bio || "");
  const specialtiesChanged =
    specialties.length !== trainer.specialties.length ||
    !specialties.every((s) => trainer.specialties.includes(s));

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 3, md: 4 },
        maxWidth: 980,
        mx: "auto",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/trainers")}
            sx={{ mb: 1 }}
          >
            Regresar al listado
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            {trainer.person.full_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Código: {trainer.employee_code}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          color="warning"
          onClick={() => navigate(`/trainers/${trainerId}/transfer`)}
        >
          Transferir cartera
        </Button>
      </Stack>

      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2.5, sm: 3, md: 4 },
          borderRadius: 3,
          mb: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Carga máxima de socios
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <TextField
              type="number"
              label="Carga máxima"
              fullWidth
              value={maxLoad}
              onChange={(e) => setMaxLoad(Number(e.target.value))}
              helperText="Número máximo de socios que este entrenador puede atender"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              fullWidth
              disabled={(!loadChanged && !bioChanged) || updateLoad.isPending}
              onClick={() => updateLoad.mutate({ max_member_load: maxLoad, bio })}
            >
              {updateLoad.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <TextField
            label="Biografía / especialidad general"
            fullWidth
            multiline
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Ej: Especialista en fuerza y acondicionamiento..."
          />
        </Box>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2.5, sm: 3, md: 4 },
          borderRadius: 3,
          mb: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Especialidades
        </Typography>
        <Autocomplete
          multiple
          options={ALL_SPECIALTIES}
          getOptionLabel={(o) => specialtyLabel[o]}
          value={specialties}
          onChange={(_, value) => setSpecialties(value)}
          renderInput={(params) => <TextField {...params} label="Especialidades" />}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip label={specialtyLabel[option]} {...getTagProps({ index })} key={option} />
            ))
          }
        />
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            disabled={!specialtiesChanged || replaceSpecialties.isPending}
            onClick={() => replaceSpecialties.mutate({ specialties })}
          >
            {replaceSpecialties.isPending ? "Guardando..." : "Guardar especialidades"}
          </Button>
        </Box>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2.5, sm: 3, md: 4 },
          borderRadius: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Información de contacto
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
              Documento
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {trainer.person.document_type} {trainer.person.document_number}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
              Correo
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {trainer.person.email || "—"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
              Teléfono
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {trainer.person.phone || "—"}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}