import { useState, useEffect } from "react";
import { useAuth } from "../../authContext";
import { useNavigate } from "react-router-dom";

import { Box, Button } from "@mui/material";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import ThoughtBubble from "../../imgs/thoughtbubble.svg";
import Trash from "../../imgs/trash.svg";

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
  onClose,
}: {
  noteData: NoteData | null;
  date: string;
  onClose?: () => void;
}) {
  const [note, setNote] = useState({
    id: noteData?.id ? noteData.id : "",
    note: noteData?.note ? noteData.note : "",
  });
  const NOTE = note.note.trim() !== "";

  const [isEditing, setIsEditing] = useState(noteData ? false : true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Sync local state when noteData prop changes (after saving/fetching)
  useEffect(() => {
    if (noteData) {
      setNote({
        id: noteData.id,
        note: noteData.note,
      });
      setIsEditing(false);
    }
  }, [noteData]);

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
      // Close modal after successful save
      onClose?.();
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
      // Close modal after successful update
      onClose?.();
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
      // Close modal after successful delete
      onClose?.();
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
          <Box>
            <img src={ThoughtBubble} alt="thought bubble" style={{ width: "60px" }} />
          </Box>
          {noteData && (
            <Button
              color="error"
              variant="outlined"
              disabled={writePending || updatePending || dltPending}
              onClick={() => {
                setConfirmDelete(true);
              }}
            >
              <img src={Trash} alt="delete" width="20" />
            </Button>
          )}
        </Box>
        <Box>
          {isEditing ? (
            <TextareaAutosize
              value={note.note}
              placeholder="....."
              aria-label="write or update a note"
              minRows={15}
              style={{ width: "100%" }}
              onChange={(e) =>
                setNote((prev) => ({ ...prev, note: e.target.value }))
              }
            />
          ) : (
            <Box
              sx={{
                whiteSpace: "pre-wrap",
                padding: "0.75rem",
                minHeight: "200px",
                backgroundColor: "var(--bg)",
                borderRadius: "var(--radius)",
                border: "1px solid var(--line)",
              }}
            >
              {note.note}
            </Box>
          )}
        </Box>
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
                  // Close modal for new notes
                  onClose?.();
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
      </Box>
      {confirmDelete && <ConfirmModal {...confirmDlt} />}
    </Box>
  );
}

export default Note;
