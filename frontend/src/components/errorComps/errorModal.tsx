import { useState, useEffect } from "react";
import { Box } from "@mui/material";

type Err = {
  error: string | Error;
};

function ErrorModal(error: Err) {
  const err =
    typeof error.error === "string" ? error.error : error.error.message;

  return (
    <Box
      sx={{
        position: "absolute",
      }}
    >
      <div>{err}</div>
    </Box>
  );
}

export default ErrorModal;
