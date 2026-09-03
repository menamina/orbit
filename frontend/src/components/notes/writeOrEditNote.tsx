type NoteData = {
  id: number | null;
  note: string | null;
};

function Note({ noteData = null }: NoteData) {
  return (
    <>
      {noteData === null && (
        <Box>
          <Box>Today's date here</Box>
          <Box></Box>
        </Box>
      )}
    </>
  );
}

export default Note;
