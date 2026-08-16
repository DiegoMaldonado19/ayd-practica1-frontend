import type { ReactNode } from "react";
import { Controller, type Control, type FieldErrors } from "react-hook-form";
import TextField from "@mui/material/TextField";
import type { ClassFormValues } from "@/modules/classes/classFormSchema";

type ClassFormFieldProps = {
  control: Control<ClassFormValues>;
  errors: FieldErrors<ClassFormValues>;
  name: keyof ClassFormValues;
  label: string;
  type?: string;
  select?: boolean;
  children?: ReactNode;
  onChange?: (value: string) => unknown;
  value?: (fieldValue: unknown) => unknown;
};

export function ClassFormField({
  control,
  errors,
  name,
  label,
  type = "text",
  select,
  children,
  onChange,
  value,
}: ClassFormFieldProps) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          value={value ? value(field.value) : (field.value ?? "")}
          type={type}
          select={select}
          label={label}
          fullWidth
          error={!!errors[name]}
          helperText={errors[name]?.message}
          InputLabelProps={type === "time" ? { shrink: true } : undefined}
          onChange={(e) => {
            const next = onChange ? onChange(e.target.value) : e.target.value;
            field.onChange(next);
          }}
        >
          {children}
        </TextField>
      )}
    />
  );
}