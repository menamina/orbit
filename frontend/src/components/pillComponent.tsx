import { useState } from "react";

import { useAuth } from "../authContext";
import { useQuery } from "@tanstack/react-query";
import { getCurrentPackQuery } from "../tanstack/pillTS";

import PillPack from "./pillPack";

import { Box, Paper } from "@mui/material";

function PillComponent() {
  const { accessToken, setAccessToken } = useAuth();
  const [dayOfTheWeekToStart, setDayOfTheWeekToStart] = useState("sun");

  const weekdays = ["sun", "mon", "tues", "wed", "thur", "fri", "sat"];

  const { data: currentPack } = useQuery({
    ...getCurrentPackQuery(accessToken, setAccessToken),
  });

  return (
    <>
      {currentPack?.pills?.length === 0 ? (
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
          <PillPack
            currentPack={currentPack}
            dayOfTheWeekToStart={dayOfTheWeekToStart}
          />
        </Box>
      ) : (
        <PillPack
          currentPack={currentPack}
          dayOfTheWeekToStart={dayOfTheWeekToStart}
        />
      )}
    </>
  );
}

export default PillComponent;
