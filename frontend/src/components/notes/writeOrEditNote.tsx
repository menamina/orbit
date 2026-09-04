import { useState } from "react";
import { Box, Paper, Button } from "@mui/material";
import TextareaAutosize from "@mui/material/TextareaAutosize";

import { writeANoteMut, updateNoteMut, dltNoteMut } from "../tanstack/notesTS";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type NoteData = {
  id: number;
  note: string;
};

function Note({ noteData = null }: { noteData: NoteData | null }) {
  const [note, setNote] = useState({
    id: noteData?.id ? noteData.id : "",
    note: noteData?.note ? noteData.note : "",
  });

  const { data: writeNote, isPending: writePending } = useMutation({
    ...writeANoteMut(),
    onSuccess: () => {},
    onError: (error) => {},
  });

  const { data: updateNote, isPending: updatePending } = useMutation({
    ...updateNoteMut(),
    onSuccess: () => {},
    onError: (error) => {},
  });

  const { data: dltNote, isPending: dltPending } = useMutation({
    ...dltNoteMut(),
    onSuccess: () => {},
    onError: (error) => {},
  });

  return (
    <Box
      sx={{
        padding: "40px",
      }}
    >
      {noteData === null && (
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
              aria-label="write a note"
              minRows={15}
              style={{ width: 200 }}
              onChange={(e) =>
                setNote((prev) => ({ ...prev, note: e.target.value }))
              }
            />
          </Box>
          <Box>
            <Button onClick={() => setNote({ id: "", note: "" })}></Button>
            <Button onClick={() => noteData}></Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default Note;
