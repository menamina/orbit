import { useAuth } from "../../authContext";

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/cycle.css";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCycleByMonthYearQuery,
  trackCycleMut,
} from "../../tanstack/cycleTS";
import { getNotesByMonthQuery } from "../../tanstack/notesTS";

import dayjs, { type Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { PickerDay, type PickerDayProps } from "@mui/x-date-pickers/PickerDay";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { DayCalendarSkeleton } from "@mui/x-date-pickers/DayCalendarSkeleton";
import { ApiError } from "../../tanstack/api";

import type { CycleDays } from "../../tanstack/cycleTypes";

import ErrorDiv from "../popups/errorDiv";
import ErrorModal from "../popups/errorModal";
import NoteCyclePopUp from "./popup";

dayjs.extend(utc);

const DATE_FMT = "YYYY-MM-DD";

type CycleDayExtraProps = {
  periodDates?: Set<string>;
  pendingDates?: Set<string>;
  noteDays?: Set<number>;
  ovulationDays?: Set<number>;
  editing?: boolean;
  onDayClick?: (day: Dayjs) => void;
};

function CycleDay(props: PickerDayProps & CycleDayExtraProps) {
  const {
    periodDates,
    pendingDates,
    noteDays,
    ovulationDays,
    editing,
    onDayClick,
    day,
    outsideCurrentMonth,
    className,
    ...other
  } = props;

  const d = day as Dayjs;
  const dayStr = d.format(DATE_FMT);
  const isPeriod = !outsideCurrentMonth && !!periodDates?.has(dayStr);
  const isStart =
    isPeriod && !periodDates?.has(d.subtract(1, "day").format(DATE_FMT));
  const isEnd = isPeriod && !periodDates?.has(d.add(1, "day").format(DATE_FMT));
  const isPending = editing && !!pendingDates?.has(dayStr);
  const isOvulation = !outsideCurrentMonth && !!ovulationDays?.has(d.date());
  const hasNote = !outsideCurrentMonth && !!noteDays?.has(d.date());

  const classes = [
    className,
    "cycle-day",
    isPeriod && "is-period",
    isStart && "is-start",
    isEnd && "is-end",
    isPending && "is-pending",
    isOvulation && "is-ovulation",
    editing && "is-editing",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className="cycle-day-wrap">
      <PickerDay
        {...other}
        day={day}
        outsideCurrentMonth={outsideCurrentMonth}
        className={classes}
        onDaySelect={(selected) => onDayClick?.(selected as Dayjs)}
      />
      {hasNote && <span className="cycle-day-note" aria-label="has note" />}
    </span>
  );
}

function Calendar() {
  const { accessToken, setAccessToken, setUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [visibleMonth, setVisibleMonth] = useState(() => dayjs());
  const currentMonth = visibleMonth.month() + 1;
  const currentYear = visibleMonth.year();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const [pending, setPending] = useState<Set<string>>(new Set());

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

  const {
    mutate: trackCycle,
    isPending: savePending,
    error: saveError,
  } = useMutation({
    ...trackCycleMut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cycle"] });
      exitEditMode();
    },
  });

  const trackedDays = useMemo(() => {
    const map = new Map<string, number | undefined>();
    thisMonthsData?.cycleDays?.forEach((d) => map.set(d.date, d.id));
    return map;
  }, [thisMonthsData]);

  const periodDates = useMemo(() => {
    const set = new Set(trackedDays.keys());
    if (editing) {
      pending.forEach((date) =>
        set.has(date) ? set.delete(date) : set.add(date),
      );
    }
    return set;
  }, [trackedDays, pending, editing]);

  const noteDays = useMemo(
    () =>
      new Set(
        (monthNotes ?? []).map((note) =>
          typeof note.date === "number" ? note.date : dayjs.utc(note.date).date(),
        ),
      ),
    [monthNotes],
  );

  const ovulationDays = useMemo(
    () => new Set(thisMonthsData?.ovulationDates ?? []),
    [thisMonthsData],
  );

  function exitEditMode() {
    setEditing(false);
    setPending(new Set());
  }

  function handleDayClick(day: Dayjs) {
    const dateStr = day.format(DATE_FMT);

    if (!editing) {
      setSelectedDate(dateStr);
      return;
    }

    setPending((prev) => {
      const next = new Set(prev);
      if (next.has(dateStr)) next.delete(dateStr);
      else next.add(dateStr);
      return next;
    });
  }

  function handleSave() {
    const payload: CycleDays[] = [...pending].map((date) => {
      const id = trackedDays.get(date);
      return trackedDays.has(date) && id !== undefined
        ? { id, date }
        : { date };
    });

    trackCycle({
      accessToken,
      onTokenRefresh: setAccessToken,
      cycleDays: payload,
    });
  }

  function handleMonthChange(date: Dayjs) {
    setVisibleMonth(date);
    setSelectedDate(null);
    exitEditMode();
  }

  const isAuthError = [thisMonthError, notesError, saveError].some(
    (err) => err instanceof ApiError && err.isAuthError(),
  );

  return (
    <div className="cycle-calendar">
      {isAuthError && (
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
      {saveError && <ErrorDiv error={saveError} />}

      <header className="cycle-header">
        <h1>Your cycle</h1>
        <p>
          {editing ? "Tap days to add or remove period days, then save." : null}
        </p>
      </header>

      <div className={`cycle-card ${editing ? "is-editing" : ""}`}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar
            value={null}
            referenceDate={visibleMonth}
            loading={thisMonthPending || notesPending}
            onMonthChange={handleMonthChange}
            renderLoading={() => <DayCalendarSkeleton />}
            disableFuture={editing}
            views={["day"]}
            slots={{ day: CycleDay }}
            slotProps={{
              day: {
                periodDates,
                pendingDates: pending,
                noteDays,
                ovulationDays,
                editing,
                onDayClick: handleDayClick,
              } as Partial<PickerDayProps>,
            }}
          />
        </LocalizationProvider>

        <div className="cycle-legend">
          <span>
            <i className="dot dot-period" /> Period
          </span>
          <span>
            <i className="dot dot-ovulation" /> Ovulation
          </span>
          <span>
            <i className="dot dot-note" /> Note
          </span>
        </div>

        <div className="cycle-actions">
          {editing ? (
            <>
              <button
                className="btn btn-ghost"
                onClick={exitEditMode}
                disabled={savePending}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={savePending || pending.size === 0}
              >
                {savePending
                  ? "Saving…"
                  : `Save${pending.size ? ` (${pending.size})` : ""}`}
              </button>
            </>
          ) : (
            <button className="btn btn-soft" onClick={() => setEditing(true)}>
              Edit period days
            </button>
          )}
        </div>
      </div>

      {selectedDate && (
        <NoteCyclePopUp
          date={selectedDate}
          onClose={() => setSelectedDate(null)}
          onEditPeriod={() => {
            setSelectedDate(null);
            setEditing(true);
          }}
        />
      )}
    </div>
  );
}

export default Calendar;
