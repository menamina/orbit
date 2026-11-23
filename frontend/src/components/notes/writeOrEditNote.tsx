import { useState } from "react";
import { useAuth } from "../../authContext";
import { useNavigate } from "react-router-dom";

import { Box, Button } from "@mui/material";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import ThoughtBubble from "../../imgs/thoughtbubble.svg";
import dayjs from "dayjs";

import {
  writeANoteMut,
  updateNoteMut,
  dltNoteMut,
} from "../../tanstack/notesTS";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "../../tanstack/api";

import ErrorDiv from "../popups/errorDiv";
import ErrorModal from "../popups/errorModal";
import ConfirmModal from "../popups/confirmModal";
import type { ConfirmModalProps } from "../popups/confirmModal";

type NoteData = {
  id: number;
  note: string;
};

function Note({
  noteData = null,
  date,
}: {
  noteData: NoteData | null;
  date: string;
}) {
  const [note, setNote] = useState({
    id: noteData?.id ? noteData.id : "",
    note: noteData?.note ? noteData.note : "",
  });
  const NOTE = note.note.trim() !== "";
  const isFutureDate = dayjs(date).isAfter(dayjs(), "day");

  const [isEditing, setIsEditing] = useState(noteData ? false : !isFutureDate);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { accessToken, setAccessToken, setUser } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: writeNote,
    isPending: writePending,
    error: writeError,
  } = useMutation({
    ...writeANoteMut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thisDaysNote", date] });
      queryClient.invalidateQueries({ queryKey: ["userNotes"] });
    },
  });

  const {
    mutate: updateNote,
    isPending: updatePending,
    error: updateError,
  } = useMutation({
    ...updateNoteMut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thisDaysNote", date] });
      queryClient.invalidateQueries({ queryKey: ["userNotes"] });
      setIsEditing(false);
    },
  });

  const {
    mutate: dltNote,
    isPending: dltPending,
    error: dltError,
  } = useMutation({
    ...dltNoteMut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thisDaysNote", date] });
      queryClient.invalidateQueries({ queryKey: ["userNotes"] });
    },
  });

  const confirmDlt: ConfirmModalProps = {
    message: "Are you sure you want to delete this note?",
    onConfirm: () => {
      if (noteData) {
        dltNote({
          accessToken,
          onTokenRefresh: setAccessToken,
          noteID: noteData.id,
        });
      }
    },
    onCancel: () => setConfirmDelete(false),
    isPending: dltPending,
  };

  return (
    <Box
      sx={{
        padding: "40px",
      }}
    >
      {((writeError instanceof ApiError && writeError.isAuthError()) ||
        (updateError instanceof ApiError && updateError.isAuthError()) ||
        (dltError instanceof ApiError && dltError.isAuthError())) && (
        <ErrorModal
          error="Your session expired. Please login again."
          onClose={() => {
            setAccessToken(null);
            setUser(null);
            navigate("/login");
          }}
        />
      )}
      {writeError && <ErrorDiv error={writeError} />}
      {updateError && <ErrorDiv error={updateError} />}
      {dltError && <ErrorDiv error={dltError} />}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          {noteData && (
            <Button
              color="error"
              variant="outlined"
              disabled={writePending || updatePending || dltPending}
              onClick={() => {
                setConfirmDelete(true);
              }}
            >
              {/* trash can icon */}
              <img src="" alt="" />
            </Button>
          )}
          <Box>
            <img src={ThoughtBubble} alt="thought bubble" style={{ width: "60px" }} />
          </Box>
        </Box>
        <Box>
          {isFutureDate && (
            <Box sx={{ color: "var(--muted)", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
              You cannot create notes for future dates.
            </Box>
          )}
          <TextareaAutosize
            value={note.note}
            placeholder={isFutureDate ? "Cannot edit future dates" : "....."}
            aria-label="write or update a note"
            minRows={15}
            style={{ width: 200 }}
            disabled={!isEditing || isFutureDate}
            onChange={(e) =>
              setNote((prev) => ({ ...prev, note: e.target.value }))
            }
          />
        </Box>
        {!isFutureDate && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: "0.5rem",
            }}
          >
            {isEditing && (
              <Button
                disabled={writePending || updatePending || dltPending}
                onClick={() => {
                  if (noteData) {
                    // Restore original note text for existing notes
                    setNote({ id: noteData.id, note: noteData.note });
                    setIsEditing(false);
                  } else {
                    // Reset for new notes
                    setNote({ id: "", note: "" });
                  }
                }}
              >
                cancel
              </Button>
            )}
            <Button
              disabled={
                (!NOTE && (isEditing || !noteData)) ||
                writePending ||
                updatePending ||
                dltPending
              }
              onClick={() => {
                if (!noteData) {
                  writeNote({
                    accessToken,
                    onTokenRefresh: setAccessToken,
                    note: note.note,
                    date,
                  });
                } else if (noteData && !isEditing) {
                  setIsEditing(true);
                } else {
                  updateNote({
                    accessToken,
                    onTokenRefresh: setAccessToken,
                    noteID: Number(note.id),
                    noteContent: note.note,
                  });
                }
              }}
            >
              {!noteData ? "save" : isEditing ? "update" : "edit"}
            </Button>
          </Box>
        )}
      </Box>
      {confirmDelete && <ConfirmModal {...confirmDlt} />}
    </Box>
  );
}

export default Note;
