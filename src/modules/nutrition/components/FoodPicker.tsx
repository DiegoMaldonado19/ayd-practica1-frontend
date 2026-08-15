import { useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useFoods } from "../hooks";

interface FoodPickerProps {
  value: number | null;
  onChange: (foodId: number | null) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
}

export function FoodPicker({
  value,
  onChange,
  label = "Buscar alimento",
  error = false,
  helperText = "",
  disabled = false,
}: FoodPickerProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useFoods({
    search: searchTerm,
    size: 20,
    page: 0,
    active: true,
  });

  const options = data?.content ?? [];

  const selectedFood = options.find((food) => food.food_id === value) ?? null;

  return (
    <Autocomplete
      options={options}
      value={selectedFood}
      onChange={(_event, newValue) => {
        onChange(newValue?.food_id ?? null);
      }}
      onInputChange={(_event, newInputValue, reason) => {
        if (reason === "input") {
          setSearchTerm(newInputValue);
        }
      }}
      getOptionLabel={(option) => `${option.name} (${option.serving_size} ${option.serving_unit.toLowerCase()})`}
      isOptionEqualToValue={(option, selected) => option.food_id === selected.food_id}
      loading={isLoading}
      disabled={disabled}
      renderInput={(params) => (
        <TextField {...params} label={label} error={error} helperText={helperText} InputProps={params.InputProps} />
      )}
    />
  );
}
