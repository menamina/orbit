import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../authContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { getCurrentPackQuery } from "../tanstack/pillTS";

import type { PillPack, Pill } from "./pillTypes";
import { type AuthParams } from "./api";

import { TextField, Button, Box, Paper } from "@mui/material";

function Pill() {
  const { user, accessToken, setAccessToken } = useAuth();

  const { data: currentPack } = useQuery({
    ...getCurrentPackQuery(accessToken, setAccessToken),
  });

  return (
    <>
      <Box></Box>
    </>
  );
}

export default Pill;
