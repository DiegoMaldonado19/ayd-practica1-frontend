import { useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { getErrorMessage } from "@/api/types";
import { useCreateNote } from "../hooks";
import type { TrainerNoteType } from "../types";

interface NoteFormDialogProps {
  open: boolean;
  onClose: () => void;
  memberId: number;
}

const NOTE_TYPE_LABEL: Record<TrainerNoteType, string> = {
  NUTRITION: "Nutrición",
  TRAINING: "Entrenamiento",
  GENERAL: "General",
};

export function NoteFormDialog({ open, onClose, memberId }: NoteFormDialogProps) {
  const [noteType, setNoteType] = useState<TrainerNoteType>("GENERAL");
  const [content, setContent] = useState("");
  const [referenceDate, setReferenceDate] = useState("");

  const createNote = useCreateNote(memberId);

  const handleClose = () => {
    setNoteType("GENERAL");
    setContent("");
    setReferenceDate("");
    createNote.reset();
    onClose();
  };

  const canSubmit = content.trim() !== "" && !createNote.isPending;

  const submit = () => {
    if (content.trim() === "") return;
    createNote.mutate(
      {
        note_type: noteType,
        content: content.trim(),
        reference_date: referenceDate === "" ? undefined : referenceDate,
      },
      { onSuccess: () => handleClose() },
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Agregar observación</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField
            select
            label="Tipo de observación"
            value={noteType}
            onChange={(e) => setNoteType(e.target.value as TrainerNoteType)}
            fullWidth
          >
            {(Object.keys(NOTE_TYPE_LABEL) as TrainerNoteType[]).map((type) => (
              <MenuItem key={type} value={type}>
                {NOTE_TYPE_LABEL[type]}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Contenido"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            multiline
            minRows={3}
            required
            fullWidth
          />

          <TextField
            type="date"
            label="Fecha de referencia (opcional)"
            value={referenceDate}
            onChange={(e) => setReferenceDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          {createNote.isError && (
            <Alert severity="error" onClose={() => createNote.reset()}>
              {getErrorMessage(createNote.error, "No se pudo agregar la observación")}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={createNote.isPending}>
          Cancelar
        </Button>
        <Button variant="contained" disabled={!canSubmit} onClick={submit}>
          {createNote.isPending ? "Guardando..." : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
