import { useAuth } from "../../authContext";

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";
import { getCycleByMonthYearQuery } from "../../tanstack/cycleTS";
import { getNotesByMonthQuery } from "../../tanstack/notesTS";

import { Dayjs } from "dayjs";
import Badge from "@mui/material/Badge";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { PickerDay, PickerDayProps } from "@mui/x-date-pickers/PickerDay";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { DayCalendarSkeleton } from "@mui/x-date-pickers/DayCalendarSkeleton";
import { ApiError } from "../../tanstack/api";

import ErrorDiv from "../popups/errorDiv";
import ErrorModal from "../popups/errorModal";
import NoteCyclePopUp from "./popup";

const today = new Date();
const month = today.getMonth() + 1;
const year = today.getFullYear();
const todayString = today.toISOString().split("T")[0] as string;

function Calendar() {
  const { accessToken, setAccessToken, setUser } = useAuth();
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(month);
  const [currentYear, setCurrentYear] = useState(year);
  const [showOtherComp, setShowOtherComp] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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
    if (thisMonthsData?.cycleTracking.length === 0) return [];

    const lastDayOfMonth = new Date(currentYear, currentMonth, 0).getDate();

    return thisMonthsData?.cycleTracking
      .filter((cycle) => cycle.startDate)
      .map((cycle) => {
        const startDate = new Date(cycle.startDate);
        const endDateValue = cycle.endDate || cycle.estimateEndDate;

        if (!endDateValue) {
          if (
            startDate.getMonth() + 1 === currentMonth &&
            startDate.getFullYear() === currentYear
          ) {
            return { start: startDate.getDate(), end: startDate.getDate() };
          }
          return null;
        }

        const endDate = new Date(endDateValue);

        const monthStart = new Date(currentYear, currentMonth - 1, 1); // first day of current month
        const monthEnd = new Date(currentYear, currentMonth, 0); // last day of current month

        const periodOverlapsMonth =
          startDate <= monthEnd && endDate >= monthStart;

        if (!periodOverlapsMonth) {
          return null;
        }

        // Clamp to current month boundaries
        let displayStart = 1;
        let displayEnd = lastDayOfMonth;

        // If period starts in this month, use actual start date
        if (
          startDate.getMonth() + 1 === currentMonth &&
          startDate.getFullYear() === currentYear
        ) {
          displayStart = startDate.getDate();
        }

        // If period ends in this month, use actual end date
        if (
          endDate.getMonth() + 1 === currentMonth &&
          endDate.getFullYear() === currentYear
        ) {
          displayEnd = endDate.getDate();
        }

        return {
          start: displayStart,
          end: displayEnd,
        };
      })
      .filter(
        (range): range is { start: number; end: number } => range !== null,
      );
  }, [thisMonthsData, currentMonth, currentYear]);

  const noteDays = useMemo(() => {
    if (!monthNotes) return [];
    return monthNotes.map((note) =>
      typeof note.date === "number" ? note.date : new Date(note.date).getDate(),
    );
  }, [monthNotes]);

  const ovulationDays = useMemo(() => {
    if (!thisMonthsData?.settings || !thisMonthsData?.cycleTracking) return [];

    const { ovulationPrediction } = thisMonthsData.settings;
    if (!ovulationPrediction) return [];

    const days: number[] = [];

    thisMonthsData.cycleTracking.forEach((cycle) => {
      if (cycle.startDate) {
        const startDate = new Date(cycle.startDate);
        const ovulationDate = new Date(startDate);
        ovulationDate.setDate(ovulationDate.getDate() + ovulationPrediction);

        if (
          ovulationDate.getMonth() + 1 === currentMonth &&
          ovulationDate.getFullYear() === currentYear
        ) {
          days.push(ovulationDate.getDate());
        }
      }
    });

    return days;
  }, [thisMonthsData, currentMonth, currentYear]);

  function markedDays(
    props: PickerDayProps & {
      periodRanges?: Array<{ start: number; end: number }>;
      ovulationDays?: number[];
      noteDays?: number[];
      onDayDoubleClick?: (date: string) => void;
    },
  ) {
    const {
      periodRanges = [],
      ovulationDays = [],
      noteDays = [],
      onDayDoubleClick,
      day,
      outsideCurrentMonth,
      ...other
    } = props;

    const dayNum = day.date();

    const periodInfo = periodRanges.find(
      (range: { start: number; end: number }) =>
        dayNum >= range.start && dayNum <= range.end,
    );
    const isInPeriod = !outsideCurrentMonth && periodInfo;
    const isPeriodStart = periodInfo && dayNum === periodInfo.start;
    const isPeriodEnd = periodInfo && dayNum === periodInfo.end;

    const isOvulation = !outsideCurrentMonth && ovulationDays.includes(dayNum);
    const hasNote = !outsideCurrentMonth && noteDays.includes(dayNum);

    const badgeContent = hasNote && "📝";

    return (
      <Badge
        key={day.toString()}
        overlap="circular"
        badgeContent={badgeContent}
      >
        <PickerDay
          {...other}
          onDoubleClick={() => {
            if (onDayDoubleClick) {
              onDayDoubleClick(day.format("YYYY-MM-DD"));
            }
          }}
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

            ...(isOvulation && {
              border: "2px solid #9C27B0",
              fontWeight: "bold",
            }),
          }}
        />
      </Badge>
    );
  }

  function handleMonthChange(date: Dayjs) {
    setCurrentMonth(date.month() + 1);
    setCurrentYear(date.year());
  }

  function handleDayDoubleClick(date: string) {
    setSelectedDate(date);
    setShowOtherComp(true);
  }

  return (
    <>
      {((thisMonthError instanceof ApiError && thisMonthError.isAuthError()) ||
        (notesError instanceof ApiError && notesError.isAuthError())) && (
        <ErrorModal
          error="Your session expired. Please login again."
          onClose={() => {
            setAccessToken(null);
            setUser(null);
            navigate("/login");
          }}
        />
      )}
      {thisMonthError && <ErrorDiv error={thisMonthError} />}
      {notesError && <ErrorDiv error={notesError} />}

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
              onDayDoubleClick: handleDayDoubleClick,
            } as any,
          }}
        />
      </LocalizationProvider>

      {showOtherComp && selectedDate && (
        <NoteCyclePopUp
          date={selectedDate}
          onClose={() => setShowOtherComp(false)}
        />
      )}
    </>
  );
}

export default Calendar;
