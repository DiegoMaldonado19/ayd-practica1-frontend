import { useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useMembers } from "@/modules/members/hooks";

interface MemberPickerProps {
  value: number | null;
  onChange: (memberId: number | null) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
}

export function MemberPicker({
  value,
  onChange,
  label = "Buscar socio",
  error = false,
  helperText = "",
}: MemberPickerProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useMembers({
    search: searchTerm,
    size: 20,
    page: 0,
  });

  const options = data?.content ?? [];

  const selectedMember = options.find((member) => member.member_id === value) ?? null;

  return (
    <Autocomplete
      options={options}
      value={selectedMember}
      onChange={(_event, newValue) => {
        onChange(newValue?.member_id ?? null);
      }}
      onInputChange={(_event, newInputValue, reason) => {
        if (reason === "input") {
          setSearchTerm(newInputValue);
        }
      }}
      getOptionLabel={(option) =>
        `${option.person?.full_name ?? ""} (${option.person?.document_number ?? ""})`
      }
      isOptionEqualToValue={(option, selected) => option.member_id === selected.member_id}
      loading={isLoading}
      renderInput={(params) => (
        <TextField {...params} label={label} error={error} helperText={helperText} InputProps={params.InputProps} />
      )}
    />
  );
}
