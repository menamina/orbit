import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authContext"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TextField, Button, Box, Paper } from "@mui/material";

import { getCurrentPackQuery } from "../tanstack/pillTS";

function Pill() {
  const { user, accessToken, onTokenRefresh } = useAuth()


  const { data: currentPack,  } = useMutation({ getCurrentPackQuery(accessToken, onTokenRefresh) });

  return (
    <>
      <Box></Box>
    </>
  );
}

export default Pill;
