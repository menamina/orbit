import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../authContext";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCycleByMonthYearQuery } from "../../tanstack/cycleTS";
import { getNoteByDayQuery } from "../../tanstack/notesTS";

import { ApiError } from "../../tanstack/api";

import { Box, TextField } from "@mui/material";

import ErrorDiv from "../popups/errorDiv";
import ErrorModal from "../popups/errorModal";
import IconOptions from "./iconOptions";

const today = new Date();
const month = today.getMonth() + 1;
const year = today.getFullYear();
const todayString = today.toISOString().split("T")[0] as string;

function CycleCalendar() {
  const { accessToken, setAccessToken, setUser } = useAuth();
  const queryClient = useQueryClient();

  // errors \\
  const [errors, setErrors] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const {
    data: thisMonthsData,
    isPending: thisMonthPending,
    error: thisMonthError,
  } = useQuery({
    ...getCycleByMonthYearQuery(month, year, accessToken, setAccessToken),
  });

  const {
    data: noteForToday,
    isPending: noteTodayPending,
    error: noteTodayError,
  } = useQuery({
    ...getNoteByDayQuery(todayString, accessToken, setAccessToken),
  });

  if (thisMonthError) {
    if (thisMonthError instanceof ApiError && thisMonthError.isAuthError()) {
      setShowLoginModal(true);
    }
  } else if (noteTodayError) {
    if (noteForToday instanceof ApiError && noteForToday.isAuthError()) {
      setShowLoginModal(true);
    }
  }

  return (
    <Box>
      {showLoginModal && (
        <ErrorModal
          error="Your session expired. Please login again."
          onClose={() => {
            setAccessToken(null);
            setUser(null);
          }}
        />
      )}
      {thisMonthError &&
        !showLoginModal &&
        !(thisMonthError instanceof ApiError && thisMonthError.isAuthError())(
          <ErrorDiv error={thisMonthError.message} />,
        )}
      {noteTodayError && !showLoginModal && (
        <ErrorDiv error={noteTodayError.message} />
      )}
    </Box>
  );
}

export default CycleCalendar;
