import { useState } from "react";
import { useAuth } from "../../authContext";
import { useNavigate } from "react-router-dom";

import { Box, Button } from "@mui/material";
import TextareaAutosize from "@mui/material/TextareaAutosize";

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
  onClose: () => void;
}) {
  const [note, setNote] = useState({
    id: noteData?.id ? noteData.id : "",
    note: noteData?.note ? noteData.note : "",
  });
  const NOTE = Object.values(note).every((item) => item !== "");

  const [isEditing, setIsEditing] = useState(noteData ? false : true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { accessToken, setAccessToken, setUser } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [showLoginModal, setShowLoginModal] = useState(false);

  const {
    mutate: writeNote,
    isPending: writePending,
    error: writeError,
  } = useMutation({
    ...writeANoteMut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thisDaysNote", date] });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.isAuthError()) {
        setShowLoginModal(true);
      }
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
      setIsEditing(false);
    },
    onError: (error) => {
      if (error instanceof ApiError && error.isAuthError()) {
        setShowLoginModal(true);
      }
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
    },
    onError: (error) => {
      if (error instanceof ApiError && error.isAuthError()) {
        setShowLoginModal(true);
      }
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
      {writeError && !showLoginModal && <ErrorDiv error={writeError} />}
      {updateError && !showLoginModal && <ErrorDiv error={updateError} />}
      {dltError && !showLoginModal && <ErrorDiv error={dltError} />}
      <Box
        sx={{
          display: "flex",
          direction: "column",
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
          <Box>something with a thought bubble</Box>
        </Box>
        <Box>
          <TextareaAutosize
            value={note.note}
            placeholder="....."
            aria-label="write or update a note"
            minRows={15}
            style={{ width: 200 }}
            disabled={!isEditing}
            onChange={(e) =>
              setNote((prev) => ({ ...prev, note: e.target.value }))
            }
          />
        </Box>
        <Box>
          <Button
            disabled={writePending || updatePending || dltPending}
            onClick={onClose}
          >
            cancel
          </Button>
          <Button
            disabled={
              (!NOTE && isEditing) ||
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
      {showLoginModal && (
        <ErrorModal
          error="Your session expired. Please login again."
          onClose={() => {
            setAccessToken(null);
            setUser(null);
            navigate("/login");
          }}
        />
      )}
      {confirmDelete && <ConfirmModal {...confirmDlt} />}
    </Box>
  );
}

export default Note;
