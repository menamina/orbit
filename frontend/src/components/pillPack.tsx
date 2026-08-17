import { useState } from "react";

import type { PillPack, Pill } from "./pillTypes";

import { Box, Paper } from "@mui/material";

function PillPack(currentPack: PillPack) {
  const [dayOfTheWeekToStart, setDayOfTheWeekToStart] = useState("sun")


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

  const today = new Date();

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
          {currentPack?.pills?.length === 0 ? (
            <>
              <Paper sx={{ gridColumn: "1 / -1", textAlign: "center" }}>
                Pick a day to start your pack
              </Paper>
              {weekdays.map((day) => (
                <Paper
                  key={day}
                  onClick={() => setDayOfTheWeekToStart(day)}
                  sx={{
                    cursor: "pointer",
                    textAlign: "center",
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
            </>
          ) : (
            startPackThisDay.map((day) => (
              <Paper key={day} sx={{ textAlign: "center" }}>
                {day}
              </Paper>
            ))
          )}
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
              key={day}
              sx={{
                textAlign: "center",
                border: "1px solid gray",
                borderRadius: "100%",
                bgcolor: currentPack?.pills?.some(
                  (pill: Pill) => pill.dayNumber === day,
                )
                  ? "#1b1a61"
                  : "white",
              }}
            ></Paper>
          ))}
        </Box>
      </Box>
    </>
  );
}

export default PillPack;
