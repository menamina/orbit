import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TextField, Button, Box, Paper } from "@mui/material";

function Pill() {
  const { data: thisMonthsBlister, error: pillError } = useQuery(
    getThisMonthsBlister(putUserIDHere),
  );

  return (
    <>
      <Box></Box>
    </>
  );
}

export default Pill;
