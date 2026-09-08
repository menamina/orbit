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
  const [editCalendar, setEditCalendar] = useState(false);
  const [daysToEdit, setDaysToEdit] = useState<string[]>([]);

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

  const periodDays = useMemo(() => {
    if (!thisMonthsData?.cycleDays) return [];
    return thisMonthsData.cycleDays.map((day) => day.date);
  }, [thisMonthsData]);

  const noteDays = useMemo(() => {
    if (!monthNotes) return [];
    return monthNotes.map((note) =>
      typeof note.date === "number" ? note.date : new Date(note.date).getDate(),
    );
  }, [monthNotes]);

  function markedDays(
    props: PickerDayProps & {
      periodDays?: string[];
      ovulationDays?: number[];
      noteDays?: number[];
    },
  ) {
    const {
      periodDays = [],
      ovulationDays = [],
      noteDays = [],
      day,
      outsideCurrentMonth,
      ...other
    } = props;

    const dayNum = day.date();
    const dayStr = day.format("YYYY-MM-DD");

    const isInPeriod = !outsideCurrentMonth && periodDays.includes(dayStr);
    const isPeriodStart =
      isInPeriod &&
      !periodDays.includes(day.subtract(1, "day").format("YYYY-MM-DD"));
    const isPeriodEnd =
      isInPeriod &&
      !periodDays.includes(day.add(1, "day").format("YYYY-MM-DD"));

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
          onDoubleClick={() => handleDayDoubleClick(day.format("YYYY-MM-DD"))}
          onClick={() => {
            if (editCalendar) {
              setDaysToEdit((prev) =>
                prev.includes(dayStr)
                  ? prev.filter((d) => d !== dayStr)
                  : [...prev, dayStr],
              );
            }
          }}
          outsideCurrentMonth={outsideCurrentMonth}
          day={day}
          sx={{
            ...(isInPeriod &&
              !daysToEdit.includes(dayStr) && {
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
          label={!editCalendar && "disabled"}
          defaultValue={todayString}
          loading={thisMonthPending || notesPending}
          onMonthChange={handleMonthChange}
          renderLoading={() => <DayCalendarSkeleton />}
          slots={{
            day: markedDays,
          }}
          slotProps={{
            day: {
              periodDays,
              noteDays,
              ovulationDays: thisMonthsData?.ovulationDates || [],
            } as any,
          }}
        />
      </LocalizationProvider>

      {showOtherComp && selectedDate && (
        <NoteCyclePopUp
          date={selectedDate}
          onClose={() => setShowOtherComp(false)}
          editCalendar={() => setEditCalendar((prev) => !prev)}
          isEditingCalendar={editCalendar}
        />
      )}
    </>
  );
}

export default Calendar;
