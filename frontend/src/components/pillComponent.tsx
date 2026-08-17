import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../authContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentPackQuery } from "../tanstack/pillTS";

import PillPack from "./pillPack";

import { TextField, Button, Box, Paper } from "@mui/material";

function PillComponent() {
  const { user, accessToken, setAccessToken } = useAuth();
  const [newPack, setNewPack] = useState(false);

  const days = [];
  for (let x = 0; x < 28; x++) {
    days.push(x + 1);
  }
  const today = new Date();

  const { data: currentPack } = useQuery({
    ...getCurrentPackQuery(accessToken, setAccessToken),
  });

  return (
    <>
      {currentPack?.pills.length === 0 && (
        <Box>
          <Paper>Start tracking now?</Paper>
          <PillPack dayOfTheWeekToStart={"sun"} />
        </Box>
      )}
    </>
  );
}

export default PillComponent;
