import { useState } from "react";
import { useAuth } from "../../authContext";

import { Box, Paper, Button } from "@mui/material";
import TextareaAutosize from "@mui/material/TextareaAutosize";

import { writeANoteMut, updateNoteMut, dltNoteMut } from "../tanstack/notesTS";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "../../tanstack/api";

import ErrorDiv from "../popups/errorDiv";
import ErrorModal from "../popups/errorModal";
import ConfirmModal from "../popups/confirmModal";

type NoteData = {
  id: number;
  note: string;
};

function Note({ noteData = null, date }: { noteData: NoteData | null, date: string }) {
  const [note, setNote] = useState({
    id: noteData?.id ? noteData.id : "",
    note: noteData?.note ? noteData.note : "",
  });

  const { accessToken, setAccessToken } = useAuth();
  const queryClient = useQueryClient();

  const [showLoginModal, setShowLoginModal] = useState(false);

  const { data: writeNote, isPending: writePending } = useMutation({
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

  const { data: updateNote, isPending: updatePending } = useMutation({
    ...updateNoteMut(),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["thisDaysNote", date] });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.isAuthError()) {
        setShowLoginModal(true);
      }
    },
  });

  const { data: dltNote, isPending: dltPending } = useMutation({
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

  return (
    <Box
      sx={{
        padding: "40px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          direction: "column",
        }}
      >
        <Box>something with a thought bubble</Box>
        <Box>
          <TextareaAutosize
            value={note.note}
            placeholder="....."
            aria-label="write or update a note"
            minRows={15}
            style={{ width: 200 }}
            onChange={(e) =>
              setNote((prev) => ({ ...prev, note: e.target.value }))
            }
          />
        </Box>
        <Box>
          <Button onClick={() => }>cancel</Button>
          <Button onClick={() => !noteData ? writeNote({accessToken, onTokenRefresh: setAccessToken, ...note }) }>{!noteData ? "save" : "update"}</Button>
        </Box>
      </Box>
    </Box>
  );
}

export default Note;
