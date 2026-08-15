import { useState } from 'react';
import {
  Autocomplete,
  TextField,
 // CircularProgress,
} from '@mui/material';
import { useMembers } from '@/modules/members/hooks';

interface MemberPickerProps {
  value: number | null;
  onChange: (memberId: number | null) => void;
  label?: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
}

export function MemberPicker({
  value,
  onChange,
  label = 'Buscar socio',
  required = false,
  error = false,
  helperText = '',
  disabled = false,
}: MemberPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useMembers({
    search: searchTerm,
    size: 20,
    page: 0,
    status: 'ACTIVE',
  });

  const options = data?.content ?? [];

  const selectedMember =
    options.find((member) => member.member_id === value) ?? null;

  return (
    <Autocomplete
      options={options}
      value={selectedMember}
      onChange={(_event, newValue) => {
        onChange(newValue?.member_id ?? null);
      }}
      onInputChange={(_event, newInputValue, reason) => {
        if (reason === 'input') {
          setSearchTerm(newInputValue);
        }
      }}
      getOptionLabel={(option) =>
        `${option.person?.full_name ?? ''} (${option.person?.document_number ?? ''})`
      }
      isOptionEqualToValue={(option, selected) =>
        option.member_id === selected.member_id
      }
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