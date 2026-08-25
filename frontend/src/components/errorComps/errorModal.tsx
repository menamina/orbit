import { useState, useEffect } from "react";
import { Box } from "@mui/material";

type Err = {
  error: string;
};

function ErrorModal(error: Err) {
  return (
    <Box
      sx={{
        position: "absolute",
      }}
    >
      <div>{error.error}</div>
    </Box>
  );
}

export default ErrorModal;
