import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import type { FilterOptionsState } from "@mui/base/useAutocomplete";
import { FormInfoIcon } from "./BillingFormField";

type BillingAutocompleteProps<T> = {
  options: T[];
  loading?: boolean;
  value: T | null;
  onChange: (value: T | null) => void;
  onInputChange?: (value: string) => void;
  getOptionLabel: (option: T) => string;
  isOptionEqualToValue?: (option: T, value: T) => boolean;
  filterOptions?: (options: T[], state: FilterOptionsState<T>) => T[];
  label: string;
  placeholder?: string;
  disabled?: boolean;
  noOptionsText?: string;
  error?: string;
  helperText?: string;
  info?: { title: string; example: string };
};

export function BillingAutocomplete<T>({
  options,
  loading,
  value,
  onChange,
  onInputChange,
  getOptionLabel,
  isOptionEqualToValue,
  filterOptions,
  label,
  placeholder,
  disabled,
  noOptionsText,
  error,
  helperText,
  info,
}: BillingAutocompleteProps<T>) {
  return (
    <Autocomplete
      options={options}
      loading={loading}
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      onInputChange={(_, newValue, reason) => {
        if (reason === "input") onInputChange?.(newValue);
      }}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      filterOptions={filterOptions}
      noOptionsText={noOptionsText}
      disabled={disabled}
      fullWidth
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={!!error}
          helperText={error ?? helperText}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {info && <FormInfoIcon info={info} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}