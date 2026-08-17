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

  const days = [];
  for (let x = 0; x < 28; x++) {
    days.push(x + 1);
  }

  const weekdays = ["sun", "MON", "tues", "wed", "thur", "fri", "sat"];

  const { data: currentPack } = useQuery({
    ...getCurrentPackQuery(accessToken, setAccessToken),
  });

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 2,
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
            gap: 2,
          }}
        >
          {days.map((day) => (
            <Paper
              key={day}
              sx={{
                p: 2,
                textAlign: "center",
                bgcolor: "grey.300",
                cursor: "pointer",
                "&:hover": {
                  bgcolor: "grey.400",
                },
              }}
            >
              {day}
            </Paper>
          ))}
        </Box>
      </Box>
    </>
  );
}

export default Pill;
