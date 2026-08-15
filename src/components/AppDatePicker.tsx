import dayjs, { type Dayjs } from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import type { SxProps, Theme } from "@mui/material/styles";
import type { TextFieldProps } from "@mui/material/TextField";

interface AppDatePickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: boolean;
  helperText?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
  size?: "small" | "medium";
  fullWidth?: boolean;
  minDate?: string;
  maxDate?: string;
  sx?: SxProps<Theme>;
  InputProps?: TextFieldProps["InputProps"];
}

function toDayjs(value: string): Dayjs | null {
  return value ? dayjs(value) : null;
}

/**
 * Wraps MUI's DatePicker behind the same plain ISO-string value/onChange shape
 * `<TextField type="date">` already had at every call site, so swapping one for
 * the other doesn't require rewriting each screen's state management.
 */
export function AppDatePicker({
  label,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  disabled,
  required,
  size,
  fullWidth,
  minDate,
  maxDate,
  sx,
  InputProps,
}: AppDatePickerProps) {
  return (
    <DatePicker
      label={label}
      value={toDayjs(value)}
      onChange={(newValue) => onChange(newValue?.isValid() ? newValue.format("YYYY-MM-DD") : "")}
      disabled={disabled}
      minDate={toDayjs(minDate ?? "") ?? undefined}
      maxDate={toDayjs(maxDate ?? "") ?? undefined}
      slotProps={{
        textField: { error, helperText, required, size, fullWidth, sx, onBlur, InputProps },
      }}
    />
  );
}
