import { useState } from "react";
import { Box, Paper, Button } from "@mui/material";

type NoteData = {
  id: number | null;
  note: string | null;
};

function Note({ noteData = null }: NoteData) {
  const today = Date.now();

  return (
    <>
      <Box>{today}</Box>
      {noteData === null && (
        <Box>
          <Box></Box>
          <Box></Box>
        </Box>
      )}
    </>
  );
}

export default Note;
