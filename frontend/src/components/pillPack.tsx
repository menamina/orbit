import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../authContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { getCurrentPackQuery } from "../tanstack/pillTS";

import type { PillPack, Pill } from "./pillTypes";
import { type AuthParams } from "./api";

import { TextField, Button, Box, Paper } from "@mui/material";

function PillPack({ dayOfTheWeekToStart = "sun" }, currentPack) {
  const { user, accessToken, setAccessToken } = useAuth();

  const days = [];
  for (let x = 0; x < 28; x++) {
    days.push(x + 1);
  }

  const weekdays = ["sun", "mon", "tues", "wed", "thur", "fri", "sat"];

  const today = new Date();

  const { data: currentPack } = useQuery({
    ...getCurrentPackQuery(accessToken, setAccessToken),
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
          {weekdays.map((weekday) => (
            <Paper key={weekday}>{weekday}</Paper>
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
              id={}
              key={day}
              sx={{
                textAlign: "center",
                border: "1px solid gray",
                borderRadius: "100%",
                bgcolor: currentPack?.pills?.some(
                  (pill) => pill.dayNumber === day,
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
