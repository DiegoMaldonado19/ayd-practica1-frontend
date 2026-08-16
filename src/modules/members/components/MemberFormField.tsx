import type { ReactNode } from "react";
import { Controller, type Control, type FieldErrors } from "react-hook-form";
import TextField from "@mui/material/TextField";
import { AppDatePicker } from "@/components/AppDatePicker";
import type { MemberFormValues } from "@/modules/members/memberFormSchema";

type MemberFormFieldProps = {
  control: Control<MemberFormValues>;
  errors: FieldErrors<MemberFormValues>;
  name: keyof MemberFormValues;
  label: string;
  type?: string;
  select?: boolean;
  multiline?: boolean;
  rows?: number;
  children?: ReactNode;
  onChange?: (value: string) => string;
  helperText?: string;
};

export function MemberFormField({
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
}: MemberFormFieldProps) {
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
            fullWidth
          />
        ) : (
          <TextField
            {...field}
            type={type}
            select={select}
            multiline={multiline}
            rows={rows}
            label={label}
            fullWidth
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