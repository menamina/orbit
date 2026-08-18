import { useAuth } from "../../authContext";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PillPack as PillPackType, Pill } from "../../tanstack/pillTypes";
import { dltPillMut, trackPillInPackMut } from "../../tanstack/pillTS";

import { Box, Paper } from "@mui/material";

interface PillPackProps {
  currentPack?: PillPackType;
  dayOfTheWeekToStart: string;
}

function PillPack({ currentPack, dayOfTheWeekToStart }: PillPackProps) {
  const { accessToken, setAccessToken } = useAuth();
  const queryClient = useQueryClient();
  const [clickedCircle, setClickedCircle] = useState<number | null>(null);

  const days = [];
  for (let x = 0; x < 28; x++) {
    days.push(x + 1);
  }

  const weekdays = ["sun", "mon", "tues", "wed", "thur", "fri", "sat"];

  const startDayIndex = weekdays.indexOf(dayOfTheWeekToStart);

  const startPackThisDay = [
    ...weekdays.slice(startDayIndex),
    ...weekdays.slice(0, startDayIndex),
  ];

  const nextDayHalo =
    currentPack?.pills && currentPack.pills.length > 0
      ? Math.max(...currentPack.pills.map((pill) => pill.dayNumber)) + 1
      : 1;

  const allNumbersInPack =
    currentPack?.pills && currentPack.pills.length > 0
      ? currentPack?.pills.map((pill) => pill.dayNumber)
      : [0];

  const { mutate: takePill, isPending: isTakingPill } = useMutation({
    ...trackPillInPackMut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentPack"] });
      setClickedCircle(null);
    },
  });

  const { mutate: dltPill, isPending: isDeletingPill } = useMutation({
    ...dltPillMut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentPack"] });
      setClickedCircle(null);
    },
  });

  return (
    <>
      <Box
        sx={{ display: "flex", flexDirection: "column", bgColor: "#E3DFFF" }}
        // or "#c6c0ec" for this box and other color for main app?
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "5px",
          }}
        >
          {startPackThisDay.map((day) => (
            <Paper key={day} sx={{ textAlign: "center", padding: "5px" }}>
              {day}
            </Paper>
          ))}
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "5px",
          }}
        >
          {days.map((day) => (
            <Paper
              onClick={() =>
                setClickedCircle((prev) => (prev !== day ? day : prev))
              }
              key={day}
              sx={{
                textAlign: "center",
                // idk how i want halo yet but for now this is it
                border:
                  day === nextDayHalo ? "1px solid blue" : "1px solid gray",
                borderRadius: "100%",

                bgcolor: currentPack?.pills?.some(
                  (pill: Pill) => pill.dayNumber === day,
                )
                  ? "#1b1a61"
                  : "white",
              }}
            ></Paper>
          ))}

          <Box>
            {clickedCircle === nextDayHalo && (
              <button
                disabled={isTakingPill}
                onClick={() =>
                  takePill({
                    packNumber: currentPack!.packNumber,
                    dayNumber: nextDayHalo,
                    date: Date.now(),
                    accessToken: accessToken,
                    onTokenRefresh: setAccessToken,
                  })
                }
              >
                {isTakingPill ? "Taking pill..." : "take today's pill"}
              </button>
            )}
            {clickedCircle && allNumbersInPack.includes(clickedCircle) && (
              <button
                disabled={isDeletingPill}
                onClick={() => {
                  const pillToDelete = currentPack?.pills?.find(
                    (pill) => pill.dayNumber === clickedCircle,
                  );
                  if (pillToDelete) {
                    dltPill({
                      pillID: pillToDelete.id,
                      accessToken: accessToken,
                      onTokenRefresh: setAccessToken,
                    });
                  }
                }}
              >
                {isDeletingPill ? "Deleting..." : "delete"}
              </button>
            )}
            {clickedCircle &&
              clickedCircle !== nextDayHalo &&
              !allNumbersInPack.includes(clickedCircle) && (
                <button
                  disabled={isTakingPill}
                  onClick={() =>
                    takePill({
                      packNumber: currentPack!.packNumber,
                      dayNumber: clickedCircle,
                      date: Date.now(),
                      accessToken: accessToken,
                      onTokenRefresh: setAccessToken,
                    })
                  }
                >
                  {isTakingPill ? "Taking pill..." : "take missed pill"}
                </button>
              )}
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default PillPack;
