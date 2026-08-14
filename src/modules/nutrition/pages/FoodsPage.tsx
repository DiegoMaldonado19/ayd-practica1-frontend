import { useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule, themeMaterial } from "ag-grid-community";
import type { ColDef } from "ag-grid-community";
import { getErrorMessage } from "@/api/types";
import { useAuth } from "@/auth/useAuth";
import { useCreateFood, useDeactivateFood, useFoods, useUpdateFood } from "../hooks";
import type { Food, FoodCategory, ServingUnit } from "../types";

ModuleRegistry.registerModules([AllCommunityModule]);

const CATEGORY_LABEL: Record<FoodCategory, string> = {
  PROTEIN: "Proteína",
  CARBOHYDRATE: "Carbohidrato",
  FAT: "Grasa",
  VEGETABLE: "Vegetal",
  FRUIT: "Fruta",
  DAIRY: "Lácteo",
  BEVERAGE: "Bebida",
  PREPARED: "Preparado",
  OTHER: "Otro",
};

const SERVING_UNIT_LABEL: Record<ServingUnit, string> = {
  GRAM: "gramos",
  MILLILITER: "mililitros",
  UNIT: "unidad",
};

interface FoodFormState {
  code: string;
  name: string;
  category: FoodCategory;
  serving_size: string;
  serving_unit: ServingUnit;
  calories: string;
  protein_g: string;
  carbohydrates_g: string;
  fat_g: string;
}

const BLANK_FORM: FoodFormState = {
  code: "",
  name: "",
  category: "OTHER",
  serving_size: "100",
  serving_unit: "GRAM",
  calories: "",
  protein_g: "",
  carbohydrates_g: "",
  fat_g: "",
};

export function FoodsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [category, setCategory] = useState<FoodCategory | "">("");
  const [editing, setEditing] = useState<Food | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FoodFormState>(BLANK_FORM);

  const { data, isLoading, isError } = useFoods({
    page: 0,
    size: 100,
    category: category || undefined,
  });

  const createFood = useCreateFood();
  const updateFood = useUpdateFood(editing?.food_id ?? 0);
  const deactivateFood = useDeactivateFood();
  const mutation = editing ? updateFood : createFood;

  const openCreate = () => {
    setEditing(null);
    setForm(BLANK_FORM);
    setFormOpen(true);
  };

  const openEdit = (food: Food) => {
    setEditing(food);
    setForm({
      code: food.code,
      name: food.name,
      category: food.category,
      serving_size: food.serving_size.toString(),
      serving_unit: food.serving_unit,
      calories: food.calories.toString(),
      protein_g: food.protein_g.toString(),
      carbohydrates_g: food.carbohydrates_g.toString(),
      fat_g: food.fat_g.toString(),
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    mutation.reset();
  };

  const submit = () => {
    mutation.mutate(
      {
        code: form.code.trim(),
        name: form.name.trim(),
        category: form.category,
        serving_size: Number(form.serving_size),
        serving_unit: form.serving_unit,
        calories: Number(form.calories),
        protein_g: Number(form.protein_g),
        carbohydrates_g: Number(form.carbohydrates_g),
        fat_g: Number(form.fat_g),
      },
      { onSuccess: closeForm },
    );
  };

  const canSubmit =
    form.code.trim() !== "" &&
    form.name.trim() !== "" &&
    form.serving_size.trim() !== "" &&
    form.calories.trim() !== "" &&
    form.protein_g.trim() !== "" &&
    form.carbohydrates_g.trim() !== "" &&
    form.fat_g.trim() !== "" &&
    !mutation.isPending;

  const columnDefs = useMemo<ColDef<Food>[]>(
    () => [
      { field: "code", headerName: "Código", width: 110 },
      { field: "name", headerName: "Nombre", flex: 1 },
      {
        headerName: "Categoría",
        width: 140,
        valueGetter: (p) => (p.data ? CATEGORY_LABEL[p.data.category] : ""),
      },
      {
        headerName: "Porción",
        width: 130,
        valueGetter: (p) => (p.data ? `${p.data.serving_size} ${SERVING_UNIT_LABEL[p.data.serving_unit]}` : ""),
      },
      { field: "calories", headerName: "Calorías", width: 100 },
      {
        headerName: "Activo",
        width: 90,
        valueGetter: (p) => (p.data?.active ? "Sí" : "No"),
      },
      {
        headerName: "Acciones",
        width: isAdmin ? 220 : 110,
        cellRenderer: (p: { data: Food }) => (
          <Stack direction="row" spacing={1}>
            <Button size="small" onClick={() => openEdit(p.data)}>
              Editar
            </Button>
            {isAdmin && p.data.active && (
              <Button size="small" color="warning" onClick={() => deactivateFood.mutate(p.data.food_id)}>
                Desactivar
              </Button>
            )}
          </Stack>
        ),
      },
    ],
    [isAdmin, deactivateFood],
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Catálogo de alimentos</Typography>
        {isAdmin && (
          <Button variant="contained" onClick={openCreate}>
            Nuevo alimento
          </Button>
        )}
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          select
          label="Categoría"
          value={category}
          onChange={(e) => setCategory(e.target.value as FoodCategory | "")}
          size="small"
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Todas</MenuItem>
          {(Object.keys(CATEGORY_LABEL) as FoodCategory[]).map((cat) => (
            <MenuItem key={cat} value={cat}>
              {CATEGORY_LABEL[cat]}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {isError && (
        <Typography color="error" sx={{ mb: 2 }}>
          No se pudo cargar el catálogo de alimentos.
        </Typography>
      )}

      <Paper sx={{ height: 520, width: "100%" }}>
        <AgGridReact
          theme={themeMaterial}
          rowData={data?.content ?? []}
          columnDefs={columnDefs}
          loading={isLoading}
          suppressCellFocus
        />
      </Paper>

      <Dialog open={formOpen} onClose={closeForm} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? "Editar alimento" : "Nuevo alimento"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Código"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Nombre"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  select
                  label="Categoría"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as FoodCategory }))}
                  fullWidth
                >
                  {(Object.keys(CATEGORY_LABEL) as FoodCategory[]).map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {CATEGORY_LABEL[cat]}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  label="Porción"
                  type="number"
                  value={form.serving_size}
                  onChange={(e) => setForm((f) => ({ ...f, serving_size: e.target.value }))}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  select
                  label="Unidad"
                  value={form.serving_unit}
                  onChange={(e) => setForm((f) => ({ ...f, serving_unit: e.target.value as ServingUnit }))}
                  fullWidth
                >
                  {(Object.keys(SERVING_UNIT_LABEL) as ServingUnit[]).map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {SERVING_UNIT_LABEL[unit]}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  label="Calorías"
                  type="number"
                  value={form.calories}
                  onChange={(e) => setForm((f) => ({ ...f, calories: e.target.value }))}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  label="Proteína (g)"
                  type="number"
                  value={form.protein_g}
                  onChange={(e) => setForm((f) => ({ ...f, protein_g: e.target.value }))}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Carbohidratos (g)"
                  type="number"
                  value={form.carbohydrates_g}
                  onChange={(e) => setForm((f) => ({ ...f, carbohydrates_g: e.target.value }))}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Grasa (g)"
                  type="number"
                  value={form.fat_g}
                  onChange={(e) => setForm((f) => ({ ...f, fat_g: e.target.value }))}
                  required
                  fullWidth
                />
              </Grid>
            </Grid>

            {mutation.isError && (
              <Alert severity="error" onClose={() => mutation.reset()}>
                {getErrorMessage(mutation.error, "No se pudo guardar el alimento")}
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeForm} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button variant="contained" disabled={!canSubmit} onClick={submit}>
            {mutation.isPending ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
