import { useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useTrainers } from "@/modules/trainers/hooks";

interface TrainerPickerProps {
  value: number | null;
  onChange: (trainerId: number | null) => void;
  label?: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
}

export function TrainerPicker({
  value,
  onChange,
  label = "Buscar entrenador",
  required = false,
  error = false,
  helperText = "",
  disabled = false,
}: TrainerPickerProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useTrainers({
    search: searchTerm,
    size: 20,
    page: 0,
  });

  const options = (data?.content ?? []).filter((trainer) => trainer.active !== false);

  const selectedTrainer = options.find((trainer) => trainer.trainer_id === value) ?? null;

  return (
    <Autocomplete
      options={options}
      value={selectedTrainer}
      onChange={(_event, newValue) => {
        onChange(newValue?.trainer_id ?? null);
      }}
      onInputChange={(_event, newInputValue, reason) => {
        if (reason === "input") {
          setSearchTerm(newInputValue);
        }
      }}
      getOptionLabel={(option) => `${option.person.full_name} · capacidad ${option.max_member_load}`}
      isOptionEqualToValue={(option, selected) => option.trainer_id === selected.trainer_id}
      loading={isLoading}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          error={error}
          helperText={helperText}
          InputProps={params.InputProps}
        />
      )}
    />
  );
}
