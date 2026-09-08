import Note from "../notes/writeOrEditNote";

import { useAuth } from "../../authContext";

import { useNavigate } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";
import { getNoteByDayQuery } from "../../tanstack/noteTS";
import type { NoteType } from "../../tanstack/notesTypes";

import Close from "../../imgs/closeArrow.svg";

import { ApiError } from "../../tanstack/api";

import { Box, Button, Modal, Paper } from "@mui/material";

import ErrorDiv from "../popups/errorDiv";
import ErrorModal from "../popups/errorModal";

function NoteCyclePopUp({
  date,
  isEditingCalendar,
  editCalendar,
  onClose,
}: {
  date: string;
  isEditingCalendar: boolean;
  editCalendar: () => void;
  onClose: () => void;
}) {
  const { accessToken, setAccessToken, setUser } = useAuth();
  const navigate = useNavigate();

  const {
    data: selectedDayNote,
    isPending: notePending,
    error: noteError,
  } = useQuery({
    ...getNoteByDayQuery(date, accessToken, setAccessToken),
    retry: false,
  });

  return (
    <>
      {noteError instanceof ApiError && noteError.isAuthError() && (
        <ErrorModal
          error="Your session expired. Please login again."
          onClose={() => {
            setAccessToken(null);
            setUser(null);
            navigate("/login");
          }}
        />
      )}
      {noteError && <ErrorDiv error={noteError} />}

      <Modal open={true} onClose={onClose}>
        <Paper>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Box sx={{ fontSize: "20px", fontWeight: "600" }}>{date}</Box>

            <Button onClick={onClose}>
              <img src={Close} alt="close" />
            </Button>
          </Box>

          {isEditingCalendar ? (
            <Box>
              <Box>
                <Button onClick={editCalendar}>cancel</Button>
              </Box>
              <Box>
                <Button onClick={update}>save</Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ mb: 2 }} onClick={editCalendar}>
              <Button variant="outlined">edit period dates</Button>
            </Box>
          )}

          <Box>
            {notePending ? (
              <Box>Loading...</Box>
            ) : (
              <Note
                noteData={
                  selectedDayNote
                    ? { id: selectedDayNote.id, note: selectedDayNote.note }
                    : null
                }
                date={date}
              />
            )}
          </Box>
        </Paper>
      </Modal>
    </>
  );
}

export default NoteCyclePopUp;
