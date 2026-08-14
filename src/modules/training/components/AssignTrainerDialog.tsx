import { useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import { getErrorMessage } from "@/api/types";
import { useAssignTrainer } from "../hooks";
import { TrainingMemberPicker } from "./TrainingMemberPicker";
import { TrainerPicker } from "./TrainerPicker";

interface AssignTrainerDialogProps {
  open: boolean;
  onClose: () => void;
  initialMemberId?: number | null;
}

export function AssignTrainerDialog({ open, onClose, initialMemberId }: AssignTrainerDialogProps) {
  const [memberId, setMemberId] = useState<number | null>(initialMemberId ?? null);
  const [trainerId, setTrainerId] = useState<number | null>(null);
  const assign = useAssignTrainer();

  const handleClose = () => {
    setMemberId(initialMemberId ?? null);
    setTrainerId(null);
    assign.reset();
    onClose();
  };

  const canSubmit = memberId != null && trainerId != null && !assign.isPending;

  const submit = () => {
    if (memberId == null || trainerId == null) return;
    assign.mutate({ member_id: memberId, trainer_id: trainerId }, { onSuccess: () => handleClose() });
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Asignar entrenador</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TrainingMemberPicker
            value={memberId}
            onChange={setMemberId}
            disabled={initialMemberId != null}
          />
          <TrainerPicker value={trainerId} onChange={setTrainerId} />

          {assign.isError && (
            <Alert severity="error" onClose={() => assign.reset()} sx={{ whiteSpace: "pre-wrap" }}>
              {getErrorMessage(assign.error, "No se pudo asignar el entrenador")}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={assign.isPending}>
          Cancelar
        </Button>
        <Button variant="contained" disabled={!canSubmit} onClick={submit}>
          {assign.isPending ? "Asignando..." : "Asignar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
