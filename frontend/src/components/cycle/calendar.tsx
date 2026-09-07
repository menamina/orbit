import { useAuth } from "../../authContext";

import { useState, useMemo } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCycleByMonthYearQuery } from "../../tanstack/cycleTS";
import { getNotesByMonthQuery } from "../../tanstack/notesTS";

import dayjs, { Dayjs } from "dayjs";
import Badge from "@mui/material/Badge";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { PickerDay, PickerDayProps } from "@mui/x-date-pickers/PickerDay";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { DayCalendarSkeleton } from "@mui/x-date-pickers/DayCalendarSkeleton";

const today = new Date();
const month = today.getMonth() + 1;
const year = today.getFullYear();
const todayString = today.toISOString().split("T")[0] as string;

function markedDays(
  props: PickerDayProps & {
    periodRanges?: Array<{ start: number; end: number }>;
    ovulationDays?: number[];
    noteDays?: number[];
  },
) {
  const {
    periodRanges = [],
    ovulationDays = [],
    noteDays = [],
    day,
    outsideCurrentMonth,
    ...other
  } = props;

  const dayNum = day.date();

  const periodInfo = periodRanges.find(
    (range: { start: number; end: number }) =>
      dayNum >= range.start && dayNum <= range.end,
  );
  const isInPeriod = !outsideCurrentMonth && !!periodInfo;
  const isPeriodStart = periodInfo && dayNum === periodInfo.start;
  const isPeriodEnd = periodInfo && dayNum === periodInfo.end;

  const isOvulation = !outsideCurrentMonth && ovulationDays.includes(dayNum);
  const hasNote = !outsideCurrentMonth && noteDays.includes(dayNum);

  const badgeContent = hasNote ? "📝" : undefined;

  return (
    <Badge key={day.toString()} overlap="circular" badgeContent={badgeContent}>
      <PickerDay
        {...other}
        outsideCurrentMonth={outsideCurrentMonth}
        day={day}
        sx={{
          ...(isInPeriod && {
            bgcolor: "rgba(255, 182, 193, 0.4)",
            borderRadius:
              isPeriodStart && isPeriodEnd
                ? "50%"
                : isPeriodStart
                  ? "50% 0 0 50%"
                  : isPeriodEnd
                    ? "0 50% 50% 0"
                    : "0",
            "&:hover": {
              bgcolor: "rgba(255, 182, 193, 0.6)",
            },
          }),
          // Ovulation indicator (purple border)
          ...(isOvulation && {
            border: "2px solid #9C27B0",
            fontWeight: "bold",
          }),
        }}
      />
    </Badge>
  );
}

function Calendar({}) {
  const { accessToken, setAccessToken, setUser } = useAuth();
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(month);
  const [currentYear, setCurrentYear] = useState(year);

  const {
    data: thisMonthsData,
    isPending: thisMonthPending,
    error: thisMonthError,
  } = useQuery({
    ...getCycleByMonthYearQuery(
      currentMonth,
      currentYear,
      accessToken,
      setAccessToken,
    ),
    retry: false,
  });

  const {
    data: monthNotes,
    isPending: notesPending,
    error: notesError,
  } = useQuery({
    ...getNotesByMonthQuery(
      { currentMonth, currentYear },
      accessToken,
      setAccessToken,
    ),
    retry: false,
  });

  const periodRanges = useMemo(() => {
    if (!thisMonthsData) return [];
    return thisMonthsData
      .filter((cycle) => cycle.startDate && cycle.endDate)
      .map((cycle) => ({
        start: new Date(cycle.startDate).getDate(),
        end: new Date(cycle.endDate!).getDate(),
      }));
  }, [thisMonthsData]);

  const noteDays = useMemo(() => {
    if (!monthNotes) return [];
    return monthNotes.map((note) =>
      typeof note.date === "number" ? note.date : new Date(note.date).getDate(),
    );
  }, [monthNotes]);

  const ovulationDays = useMemo(() => {
    if (!thisMonthsData) return [];
    return [];
  }, [thisMonthsData]);

  function handleMonthChange(date: Dayjs) {
    setCurrentMonth(date.month() + 1);
    setCurrentYear(date.year());
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateCalendar
        defaultValue={todayString}
        loading={thisMonthPending || notesPending}
        onMonthChange={handleMonthChange}
        renderLoading={() => <DayCalendarSkeleton />}
        slots={{
          day: markedDays,
        }}
        slotProps={{
          day: {
            periodRanges,
            noteDays,
            ovulationDays,
          } as any,
        }}
      />
    </LocalizationProvider>
  );
}

export default Calendar;
