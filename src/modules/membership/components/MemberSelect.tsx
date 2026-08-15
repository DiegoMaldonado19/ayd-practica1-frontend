import { useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import { useMembers } from "@/modules/members/hooks";
import type { Member } from "@/modules/members/types";

type MemberSelectProps = {
  value: Member | null;
  onChange: (member: Member | null) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
};

export function MemberSelect({
  value,
  onChange,
  label = "Socio",
  error,
  helperText,
}: MemberSelectProps) {
  const [search, setSearch] = useState("");
  const { data, isFetching } = useMembers({
    page: 0,
    size: 8,
    search: search || undefined,
  });

  return (
    <Autocomplete
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      inputValue={search}
      onInputChange={(_, newInput) => setSearch(newInput)}
      options={data?.content ?? []}
      isOptionEqualToValue={(option, val) => option.member_id === val.member_id}
      getOptionLabel={(option) =>
        `${option.person.full_name} · ${option.member_code}`
      }
      loading={isFetching}
      filterOptions={(options) => options}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          error={error}
          helperText={helperText}
          placeholder="Escribe nombre, apellido o documento"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isFetching ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}