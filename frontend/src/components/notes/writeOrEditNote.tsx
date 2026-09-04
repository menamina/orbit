import { useState } from "react";
import { Box, Paper, Button } from "@mui/material";
import TextareaAutosize from "@mui/material/TextareaAutosize";

type NoteData = {
  id: number | null;
  note: string | null;
};

function Note({ noteData = null }: NoteData) {
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
              value={noteData?.note ? noteData?.note : null}
              placeholder="....."
              aria-label="write a note"
              minRows={15}
              style={{ width: 200 }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default Note;
