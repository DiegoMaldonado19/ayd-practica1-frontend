import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Delete } from "@mui/icons-material";
import { getErrorMessage } from "@/api/types";
import { useCreateMeal, useUpdateMeal } from "../hooks";
import { FoodPicker } from "./FoodPicker";
import type { Meal, MealItemRequest, MealType } from "../types";

interface MealFormDialogProps {
  open: boolean;
  onClose: () => void;
  memberId?: number;
  meal?: Meal;
}

const MEAL_TYPE_LABEL: Record<MealType, string> = {
  BREAKFAST: "Desayuno",
  LUNCH: "Almuerzo",
  DINNER: "Cena",
  SNACK: "Merienda / snack",
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function MealFormDialog({ open, onClose, memberId, meal }: MealFormDialogProps) {
  const isEdit = Boolean(meal);
  const [logDate, setLogDate] = useState(meal?.log_date ?? todayIso());
  const [mealType, setMealType] = useState<MealType>(meal?.meal_type ?? "BREAKFAST");
  const [notes, setNotes] = useState(meal?.notes ?? "");
  const [items, setItems] = useState<MealItemRequest[]>(
    meal ? meal.items.map((item) => ({ food_id: item.food_id, quantity: item.quantity })) : [],
  );

  const createMutation = useCreateMeal(memberId);
  const updateMutation = useUpdateMeal(meal?.meal_id ?? 0, memberId);
  const mutation = isEdit ? updateMutation : createMutation;

  const handleClose = () => {
    mutation.reset();
    onClose();
  };

  const updateItem = (index: number, patch: Partial<MealItemRequest>) => {
    setItems((current) => current.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const removeItem = (index: number) => {
    setItems((current) => current.filter((_, i) => i !== index));
  };

  const addItem = () => {
    setItems((current) => [...current, { food_id: 0, quantity: 100 }]);
  };

  const canSubmit =
    items.length > 0 && items.every((item) => item.food_id > 0 && item.quantity > 0) && !mutation.isPending;

  const submit = () => {
    if (!canSubmit) return;

    if (isEdit) {
      updateMutation.mutate(
        { meal_type: mealType, notes: notes.trim() === "" ? undefined : notes.trim(), items },
        { onSuccess: () => handleClose() },
      );
    } else {
      createMutation.mutate(
        {
          log_date: logDate,
          meal_type: mealType,
          notes: notes.trim() === "" ? undefined : notes.trim(),
          items,
        },
        { onSuccess: () => handleClose() },
      );
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? "Editar comida" : "Registrar comida"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField
            type="date"
            label="Fecha"
            value={logDate}
            onChange={(e) => setLogDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ max: todayIso() }}
            disabled={isEdit}
            helperText={isEdit ? "La fecha no se puede modificar" : undefined}
            fullWidth
          />
          <TextField
            select
            label="Tiempo de comida"
            value={mealType}
            onChange={(e) => setMealType(e.target.value as MealType)}
            fullWidth
          >
            {(Object.keys(MEAL_TYPE_LABEL) as MealType[]).map((type) => (
              <MenuItem key={type} value={type}>
                {MEAL_TYPE_LABEL[type]}
              </MenuItem>
            ))}
          </TextField>

          <Typography variant="subtitle2">Alimentos</Typography>
          <Stack spacing={1.5}>
            {items.map((item, index) => (
              <Paper key={index} variant="outlined" sx={{ p: 1.5 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ flex: 1 }}>
                    <FoodPicker
                      value={item.food_id || null}
                      onChange={(foodId) => updateItem(index, { food_id: foodId ?? 0 })}
                    />
                  </Box>
                  <TextField
                    label="Cantidad (g/ml)"
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })}
                    sx={{ width: 150 }}
                  />
                  <IconButton onClick={() => removeItem(index)} aria-label="Quitar alimento">
                    <Delete />
                  </IconButton>
                </Stack>
              </Paper>
            ))}
          </Stack>

          <Button onClick={addItem} sx={{ alignSelf: "flex-start" }}>
            Agregar alimento
          </Button>

          <TextField
            label="Notas (opcional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            minRows={2}
            fullWidth
          />

          {mutation.isError && (
            <Alert severity="error" onClose={() => mutation.reset()}>
              {getErrorMessage(mutation.error, "No se pudo guardar la comida")}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={mutation.isPending}>
          Cancelar
        </Button>
        <Button variant="contained" disabled={!canSubmit} onClick={submit}>
          {mutation.isPending ? "Guardando..." : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
