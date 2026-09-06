import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../authContext";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCycleByMonthYearQuery } from "../../tanstack/cycleTS";
import { getNoteByDayQuery } from "../../tanstack/notesTS";

import { ApiError } from "../../tanstack/api";
import type { SettingsType } from "../tanstack/SettingsType";

import { Box, TextField } from "@mui/material";

import ErrorDiv from "../popups/errorDiv";
import ErrorModal from "../popups/errorModal";
import IconOptions from "./iconOptions";

const today = new Date();
const month = today.getMonth() + 1;
const year = today.getFullYear();

function CycleCalendar() {
  const { accessToken, setAccessToken, setUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: thisMonthsData, isPending: thisMonthPending } = useQuery({
    ...getCycleByMonthYearQuery(month, year, accessToken, setAccessToken),
  });

  const { data: noteForToday, isPending: noteTodayPending } = useQuery({
    ...getNoteByDayQuery(today, accessToken, setAccessToken),
  });
}

export default CycleCalendar;
