import { useState } from "react";

import { useAuth } from "../../authContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCurrentPackQuery,
  startNewPackMut,
  dltPackMut,
} from "../../tanstack/pillTS";

import PillPack from "./pillPack";

import ErrorDiv from "../errorComps/errorDiv";
import ErrorModal from "../errorComps/errorModal";
import Dots from "../imgs/dotsVert.svg";

import { Box, Paper, Button } from "@mui/material";

function PillComponent() {
  const { accessToken, setAccessToken } = useAuth();
  const [dayOfTheWeekToStart, setDayOfTheWeekToStart] = useState("sun");
  const [openDots, setOpenedDots] = useState(false);
  const [displayDltModal, setDisplayDltModal] = useState(false);

  const queryClient = useQueryClient();

  const weekdays = ["sun", "mon", "tues", "wed", "thur", "fri", "sat"];

  const { data: currentPack } = useQuery({
    ...getCurrentPackQuery(accessToken, setAccessToken),
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
  });

  const effectiveDayOfWeek = currentPack?.startDayOfWeek || dayOfTheWeekToStart;

  return (
    <>
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
      {displayDltModal && (
        <Box>
          <Box>Are you sure you want to delete this pack?</Box>
          <Box>
            <button
              disabled={dltingPackPending}
              onClick={() => {
                setOpenedDots(false);
                setDisplayDltModal(false);
              }}
            >
              cancel
            </button>
            <button
              disabled={dltingPackPending}
              onClick={() => {
                dltPack({
                  packID: currentPack!.id,
                  accessToken: accessToken,
                  onTokenRefresh: setAccessToken,
                });
              }}
            >
              delete
            </button>
          </Box>
        </Box>
      )}
      {startingPackError && <ErrorDiv error={startingPackError} />}
      {dltingPackError && <ErrorDiv error={dltingPackError} />}
    </>
  );
}

export default PillComponent;
