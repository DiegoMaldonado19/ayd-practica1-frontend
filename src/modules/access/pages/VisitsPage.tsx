import { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule, themeMaterial } from 'ag-grid-community';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import { useVisits, useCreateVisit, useCheckoutVisit, useMembersMap } from '../hooks';
import type { Visit } from '../types';
import { MemberPicker } from '../components/MemberPicker';
import { AccessNavTabs } from '../components/AccessNavTabs';

ModuleRegistry.registerModules([AllCommunityModule]);

const channelLabel: Record<Visit['channel'], string> = {
  FRONT_DESK: 'Recepción',
  SELF_SERVICE: 'Autoservicio',
};

export function VisitsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

  const open = tabValue === 0;
  const { data: visitsData, isLoading } = useVisits({ open, page: 0, size: 100 });

  const rowData = useMemo(() => visitsData?.content ?? [], [visitsData]);
  const { map: memberNames } = useMembersMap(rowData.map((v) => v.member_id));

  const createVisitMutation = useCreateVisit();
  const checkoutMutation = useCheckoutVisit();

  const createMutate = createVisitMutation.mutate;
  const checkoutMutate = checkoutMutation.mutate;
  const isCreatePending = createVisitMutation.isPending;
  const isCheckoutPending = checkoutMutation.isPending;

  const handleCheckIn = useCallback(() => {
    if (selectedMemberId) {
      createMutate(
        { member_id: selectedMemberId },
        {
          onSuccess: () => {
            setIsCheckInOpen(false);
            setSelectedMemberId(null);
          },
        }
      );
    }
  }, [selectedMemberId, createMutate]);

  const handleCheckOut = useCallback(
    (visitId: number) => {
      checkoutMutate(visitId);
    },
    [checkoutMutate]
  );

  const columnDefs = useMemo<ColDef<Visit>[]>(
    () => [
      {
        headerName: 'Socio',
        flex: 1.3,
        valueGetter: (params) =>
          params.data ? memberNames.get(params.data.member_id) ?? `Socio #${params.data.member_id}` : '',
      },
      {
        headerName: 'Canal',
        field: 'channel',
        width: 130,
        valueFormatter: (params) => channelLabel[params.value as Visit['channel']] ?? params.value,
      },
      {
        headerName: 'Check-in',
        field: 'checked_in_at',
        flex: 1,
        valueFormatter: (params) => (params.value ? new Date(params.value).toLocaleString() : ''),
      },
      {
        headerName: 'Check-out',
        field: 'checked_out_at',
        flex: 1,
        valueFormatter: (params) => (params.value ? new Date(params.value).toLocaleString() : 'En instalaciones'),
      },
      {
        headerName: 'Minutos dentro',
        field: 'minutes_inside',
        width: 140,
        valueFormatter: (params) => (params.value != null ? String(params.value) : '—'),
      },
      {
        headerName: 'Acciones',
        width: 140,
        cellRenderer: (params: ICellRendererParams<Visit>) => {
          const visit = params.data;
          if (!visit || visit.checked_out_at) return null;
          return (
            <Button
              variant="contained"
              color="secondary"
              size="small"
              onClick={() => handleCheckOut(visit.facility_visit_id)}
              disabled={isCheckoutPending}
            >
              Check-out
            </Button>
          );
        },
      },
    ],
    [handleCheckOut, isCheckoutPending, memberNames]
  );

  return (
    <Box sx={{ p: 3 }}>
      <AccessNavTabs />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Control de Acceso</Typography>
        <Button variant="contained" onClick={() => setIsCheckInOpen(true)}>
          Registrar Check-in
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_e, newValue) => setTabValue(newValue)}>
          <Tab label="En instalaciones" />
          <Tab label="Historial" />
        </Tabs>
      </Paper>

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

      <Dialog open={isCheckInOpen} onClose={() => setIsCheckInOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Registrar Check-in</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <MemberPicker
              value={selectedMemberId}
              onChange={setSelectedMemberId}
              label="Buscar socio para check-in"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCheckInOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCheckIn} disabled={!selectedMemberId || isCreatePending}>
            Confirmar Check-in
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}