import type { ReactNode } from "react";
import { Controller, type Control, type FieldErrors, type FieldValues, type Path } from "react-hook-form";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import { InfoOutlined as InfoOutlinedIcon } from "@mui/icons-material";
import { AppDatePicker } from "@/components/AppDatePicker";

export function FormInfoIcon({ info }: { info: { title: string; example: string } }) {
  return (
    <Tooltip title={`${info.title}. Ejemplo: ${info.example}`} arrow>
      <IconButton size="small" edge="end" sx={{ mr: 0.5 }}>
        <InfoOutlinedIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}

type BillingFormFieldProps<T extends FieldValues> = {
  control: Control<T>;
  errors: FieldErrors<T>;
  name: Path<T>;
  label: string;
  type?: string;
  select?: boolean;
  multiline?: boolean;
  minRows?: number;
  disabled?: boolean;
  helperText?: string;
  children?: ReactNode;
  info?: { title: string; example: string };
  value?: (v: unknown) => unknown;
  onChange?: (v: string) => unknown;
  minDate?: string;
};

export function BillingFormField<T extends FieldValues>({
  control,
  errors,
  name,
  label,
  type = "text",
  select,
  multiline,
  minRows,
  disabled,
  helperText,
  children,
  info,
  value,
  onChange,
  minDate,
}: BillingFormFieldProps<T>) {
  const error = (errors as Record<string, { message?: string } | undefined>)[name];

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) =>
        type === "date" ? (
          <AppDatePicker
            label={label}
            value={String(field.value ?? "")}
            onChange={field.onChange}
            onBlur={field.onBlur}
            disabled={disabled}
            fullWidth
            minDate={minDate}
            error={!!error}
            helperText={error?.message ?? helperText}
          />
        ) : (
          <TextField
            {...field}
            value={value ? value(field.value) : (field.value ?? "")}
            type={type}
            select={select}
            multiline={multiline}
            minRows={minRows}
            label={label}
            fullWidth
            disabled={disabled}
            error={!!error}
            helperText={error?.message ?? helperText}
            InputProps={info ? { endAdornment: <FormInfoIcon info={info} /> } : undefined}
            onChange={(e) => {
              const next = onChange ? onChange(e.target.value) : e.target.value;
              field.onChange(next);
            }}
          >
            {children}
          </TextField>
        )
      }
    />
  );
}