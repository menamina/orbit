import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../authContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCurrentPackQuery,
  startNewPackMut,
  dltPackMut,
} from "../../tanstack/pillTS";
import { ApiError } from "../../tanstack/api";

import PillPack from "./pillPack";

import ErrorDiv from "../popups/errorDiv";
import ErrorModal from "../popups/errorModal";
import ConfirmModal from "../popups/confirmModal";
import type { ConfirmModalProps } from "../popups/confirmModal";
import Dots from "../imgs/dotsVert.svg";

import { Box, Paper, Button } from "@mui/material";

function PillComponent() {
  const { accessToken, setAccessToken, setUser } = useAuth();
  const navigate = useNavigate();
  const [dayOfTheWeekToStart, setDayOfTheWeekToStart] = useState("sun");
  const [openDots, setOpenedDots] = useState(false);
  const [displayDltModal, setDisplayDltModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const queryClient = useQueryClient();

  const weekdays = ["sun", "mon", "tues", "wed", "thur", "fri", "sat"];

  const { data: currentPack, error: getCurrentPackError } = useQuery({
    ...getCurrentPackQuery(accessToken, setAccessToken),
    retry: false,
  });

  const {
    mutate: startPackMutation,
    error: startingPackError,
    isPending: newPackPending,
  } = useMutation({
    ...startNewPackMut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentPack"] });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.isAuthError()) {
        setShowLoginModal(true);
      }
    },
  });

  const {
    mutate: dltPack,
    error: dltingPackError,
    isPending: dltingPackPending,
  } = useMutation({
    ...dltPackMut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentPack"] });
      setDisplayDltModal(false);
      setOpenedDots(false);
    },
    onError: (error) => {
      if (error instanceof ApiError && error.isAuthError()) {
        setShowLoginModal(true);
      }
    },
  });

  const effectiveDayOfWeek = currentPack?.startDayOfWeek || dayOfTheWeekToStart;

  const deletePackModalProps: ConfirmModalProps = {
    message: "Are you sure you want to delete this pack?",
    onConfirm: () => {
      dltPack({
        packID: currentPack!.id,
        accessToken: accessToken,
        onTokenRefresh: setAccessToken,
      });
    },
    onCancel: () => {
      setOpenedDots(false);
      setDisplayDltModal(false);
    },
    isPending: dltingPackPending,
  };

  return (
    <>
      {startingPackError && !showLoginModal && (
        <ErrorDiv error={startingPackError} />
      )}
      {dltingPackError && !showLoginModal && (
        <ErrorDiv error={dltingPackError} />
      )}
      {!currentPack || currentPack?.pills?.length === 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <Paper sx={{ padding: "20px", textAlign: "center" }}>
            Pick a day to start your new pack
          </Paper>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "5px",
            }}
          >
            {weekdays.map((day) => (
              <Paper
                key={day}
                onClick={() => setDayOfTheWeekToStart(day)}
                sx={{
                  cursor: "pointer",
                  textAlign: "center",
                  padding: "10px",
                  bgcolor: dayOfTheWeekToStart === day ? "#1b1a61" : "white",
                  color: dayOfTheWeekToStart === day ? "white" : "black",
                  "&:hover": {
                    bgcolor:
                      dayOfTheWeekToStart === day ? "#1b1a61" : "#f0f0f0",
                  },
                }}
              >
                {day}
              </Paper>
            ))}
          </Box>
          <Button
            variant="contained"
            onClick={() =>
              startPackMutation({
                startDayOfWeek: dayOfTheWeekToStart,
                accessToken,
                onTokenRefresh: setAccessToken,
              })
            }
            disabled={newPackPending}
            sx={{
              bgcolor: "#1b1a61",
              "&:hover": {
                bgcolor: "#151349",
              },
            }}
          >
            {newPackPending ? "Starting..." : "Start Pack"}
          </Button>
          <PillPack
            currentPack={currentPack}
            dayOfTheWeekToStart={dayOfTheWeekToStart}
          />
        </Box>
      ) : (
        <>
          <PillPack
            currentPack={currentPack}
            dayOfTheWeekToStart={effectiveDayOfWeek}
          />
          <Box onClick={() => setOpenedDots(true)}>
            <img src={Dots} alt="3 dots" />
            {openDots && (
              <Box>
                <button onClick={() => setDisplayDltModal(true)}>
                  delete current pack
                </button>
                <button onClick={() => setDisplayDltModal(false)}>
                  cancel
                </button>
              </Box>
            )}
          </Box>
        </>
      )}
      {displayDltModal && <ConfirmModal {...deletePackModalProps} />}
      {(showLoginModal ||
        (getCurrentPackError instanceof ApiError &&
          getCurrentPackError.isAuthError())) && (
        <ErrorModal
          error="Your session expired. Please login again."
          onClose={() => {
            setAccessToken(null);
            setUser(null);
            navigate("/login");
          }}
        />
      )}
      {getCurrentPackError &&
        !(
          getCurrentPackError instanceof ApiError &&
          getCurrentPackError.isAuthError()
        ) && <ErrorDiv error={getCurrentPackError} />}
    </>
  );
}

export default PillComponent;
