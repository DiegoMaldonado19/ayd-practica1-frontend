import { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  MenuItem,
} from '@mui/material';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule, themeMaterial } from 'ag-grid-community';
import type { ColDef } from 'ag-grid-community';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useGuestPasses, useCreateGuestPass, useMembersMap } from '../hooks';
import type { GuestPass, PassType, CreateGuestPassDTO } from '../types';
import type { DocumentType } from '@/modules/members/types';
import { MemberPicker } from '../components/MemberPicker';

ModuleRegistry.registerModules([AllCommunityModule]);

const passTypeLabel: Record<PassType, string> = {
  FREE_TRIAL: 'Día de Prueba',
  PAID_DAY_PASS: 'Pase Pagado',
  MEMBER_GUEST: 'Invitado de Socio',
};

const schema = yup.object({
  document_type: yup.mixed<DocumentType>().oneOf(['DPI', 'PASSPORT', 'NIT']).required('Requerido'),
  document_number: yup.string().required('Requerido'),
  first_name: yup.string().required('Requerido'),
  last_name: yup.string().required('Requerido'),
  email: yup.string().email('Email inválido').required('Requerido'),
  phone: yup.string().required('Requerido'),
  pass_type: yup
    .mixed<PassType>()
    .oneOf(['FREE_TRIAL', 'PAID_DAY_PASS', 'MEMBER_GUEST'])
    .required('Requerido'),
  host_member_id: yup
    .number()
    .nullable()
    .test('host-required', 'Debe seleccionar un socio anfitrión', function (value) {
      return this.parent.pass_type !== 'MEMBER_GUEST' || value != null;
    }),
});

type GuestPassFormData = yup.InferType<typeof schema>;

export function GuestPassesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data, isLoading } = useGuestPasses({ page: 0, size: 100 });

  const rowData = useMemo(() => data?.content ?? [], [data]);
  const { map: hostNames } = useMembersMap(rowData.map((g) => g.host_member_id));

  const createMutation = useCreateGuestPass();
  const createMutate = createMutation.mutate;
  const isCreatePending = createMutation.isPending;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GuestPassFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      document_type: 'DPI',
      document_number: '',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      pass_type: 'FREE_TRIAL',
      host_member_id: null,
    },
  });

  const passType = useWatch({ control, name: 'pass_type' });

  const onSubmit = useCallback(
    (formData: GuestPassFormData) => {
      const payload: CreateGuestPassDTO = {
        person: {
          document_type: formData.document_type,
          document_number: formData.document_number,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
        },
        pass_type: formData.pass_type,
        ...(formData.pass_type === 'MEMBER_GUEST' && formData.host_member_id
          ? { host_member_id: formData.host_member_id }
          : {}),
      };

      createMutate(payload, {
        onSuccess: () => {
          reset();
          setIsFormOpen(false);
        },
      });
    },
    [createMutate, reset]
  );

  const columnDefs = useMemo<ColDef<GuestPass>[]>(
    () => [
      {
        headerName: 'Invitado',
        valueGetter: (params) => params.data?.person?.full_name ?? 'N/A',
        flex: 1,
      },
      {
        headerName: 'Documento',
        valueGetter: (params) => params.data?.person?.document_number ?? 'N/A',
        flex: 1,
      },
      {
        headerName: 'Tipo de Pase',
        field: 'pass_type',
        flex: 1,
        valueFormatter: (params) => passTypeLabel[params.value as PassType] ?? params.value,
      },
      {
        headerName: 'Anfitrión',
        flex: 1,
        valueGetter: (params) =>
          params.data?.host_member_id ? hostNames.get(params.data.host_member_id) ?? `Socio #${params.data.host_member_id}` : '—',
      },
      {
        headerName: 'Check-in',
        field: 'checked_in_at',
        flex: 1,
        valueFormatter: (params) => (params.value ? new Date(params.value).toLocaleString() : ''),
      },
    ],
    [hostNames]
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Pases de Invitado</Typography>
        <Button variant="contained" onClick={() => setIsFormOpen(true)}>
          Registrar Pase
        </Button>
      </Box>

      <Box sx={{ height: 600, width: '100%' }}>
        <AgGridReact
          theme={themeMaterial}
          rowData={rowData}
          columnDefs={columnDefs}
          loading={isLoading}
          pagination
          paginationPageSize={15}
        />
      </Box>

      <Dialog open={isFormOpen} onClose={() => setIsFormOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Registrar Pase de Invitado</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid xs={6}>
                <Controller
                  name="document_type"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Tipo de Documento" fullWidth error={!!errors.document_type} helperText={errors.document_type?.message}>
                      <MenuItem value="DPI">DPI</MenuItem>
                      <MenuItem value="PASSPORT">Pasaporte</MenuItem>
                      <MenuItem value="NIT">NIT</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid xs={6}>
                <Controller
                  name="document_number"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Número de Documento" fullWidth error={!!errors.document_number} helperText={errors.document_number?.message} />
                  )}
                />
              </Grid>
              <Grid xs={6}>
                <Controller
                  name="first_name"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Nombres" fullWidth error={!!errors.first_name} helperText={errors.first_name?.message} />
                  )}
                />
              </Grid>
              <Grid xs={6}>
                <Controller
                  name="last_name"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Apellidos" fullWidth error={!!errors.last_name} helperText={errors.last_name?.message} />
                  )}
                />
              </Grid>
              <Grid xs={6}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Correo Electrónico" fullWidth error={!!errors.email} helperText={errors.email?.message} />
                  )}
                />
              </Grid>
              <Grid xs={6}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Teléfono" fullWidth error={!!errors.phone} helperText={errors.phone?.message} />
                  )}
                />
              </Grid>
              <Grid xs={12}>
                <Controller
                  name="pass_type"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Tipo de Pase" fullWidth error={!!errors.pass_type} helperText={errors.pass_type?.message}>
                      <MenuItem value="FREE_TRIAL">Día de Prueba (Gratuito)</MenuItem>
                      <MenuItem value="PAID_DAY_PASS">Pase de Día (Pagado)</MenuItem>
                      <MenuItem value="MEMBER_GUEST">Invitado de Socio</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              {passType === 'MEMBER_GUEST' && (
                <Grid xs={12}>
                  <Controller
                    name="host_member_id"
                    control={control}
                    render={({ field }) => (
                      <MemberPicker
                        value={field.value ?? null}
                        onChange={field.onChange}
                        label="Socio Anfitrión"
                        required
                        error={!!errors.host_member_id}
                        helperText={errors.host_member_id?.message}
                      />
                    )}
                  />
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsFormOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={isCreatePending}>
            Guardar Pase
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}