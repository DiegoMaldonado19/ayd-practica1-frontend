import type { ReactNode } from "react";
import { Controller, type Control, type FieldErrors } from "react-hook-form";
import TextField from "@mui/material/TextField";
import { AppDatePicker } from "@/components/AppDatePicker";
import type { EmployeeFormValues } from "@/modules/employees/employeeFormSchema";

type EmployeeFormFieldProps = {
  control: Control<EmployeeFormValues>;
  errors: FieldErrors<EmployeeFormValues>;
  name: keyof EmployeeFormValues;
  label: string;
  type?: string;
  select?: boolean;
  multiline?: boolean;
  rows?: number;
  children?: ReactNode;
  onChange?: (value: string) => string;
  helperText?: string;
  disabled?: boolean;
};

export function EmployeeFormField({
  control,
  errors,
  name,
  label,
  type = "text",
  select,
  multiline,
  rows,
  children,
  onChange,
  helperText,
  disabled,
}: EmployeeFormFieldProps) {
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
            error={!!errors[name]}
            helperText={errors[name]?.message || helperText}
            disabled={disabled}
            fullWidth
          />
        ) : (
          <TextField
            {...field}
            value={field.value ?? ""}
            type={type}
            select={select}
            multiline={multiline}
            rows={rows}
            label={label}
            fullWidth
            disabled={disabled}
            error={!!errors[name]}
            helperText={errors[name]?.message || helperText}
            InputLabelProps={type === "date" ? { shrink: true } : undefined}
            onChange={(e) => {
              const value = onChange ? onChange(e.target.value) : e.target.value;
              field.onChange(value);
            }}
          >
            {children}
          </TextField>
        )
      }
    />
  );
}