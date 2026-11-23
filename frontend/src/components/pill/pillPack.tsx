import { useAuth } from "../../authContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PillPack as PillPackType, Pill } from "../../tanstack/pillTypes";
import { trackPillInPackMut, dltPillMut } from "../../tanstack/pillTS";

import { ApiError } from "../../tanstack/api";

import ErrorDiv from "../popups/errorDiv";
import ErrorModal from "../popups/errorModal";


interface PillPackProps {
  currentPack?: PillPackType;
  dayOfTheWeekToStart: string;
}

function PillPack({ currentPack, dayOfTheWeekToStart }: PillPackProps) {
  const { accessToken, setAccessToken, setUser } = useAuth();
  const queryClient = useQueryClient();
  const [clickedCircle, setClickedCircle] = useState<number | null>(null);
  const navigate = useNavigate();

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

  const {
    mutate: takePill,
    isPending: isTakingPill,
    error: takePillError,
  } = useMutation({
    ...trackPillInPackMut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentPack"] });
      setClickedCircle(null);
    },
  });

  const {
    mutate: dltPill,
    isPending: isDeletingPill,
    error: dltPillError,
  } = useMutation({
    ...dltPillMut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentPack"] });
      setClickedCircle(null);
    },
  });

  return (
    <div>
      {((takePillError instanceof ApiError && takePillError.isAuthError()) ||
        (dltPillError instanceof ApiError && dltPillError.isAuthError())) && (
        <ErrorModal
          error="Your session expired. Please login again."
          onClose={() => {
            setAccessToken(null);
            setUser(null);
            navigate("/login");
          }}
        />
      )}
      {takePillError && <ErrorDiv error={takePillError} />}
      {dltPillError && <ErrorDiv error={dltPillError} />}

      <div className="pill-card">
        <div className="pill-weekdays">
          {startPackThisDay.map((day) => (
            <div key={day} className="pill-weekday">
              {day}
            </div>
          ))}
        </div>
        <div className="pill-grid">
          {days.map((day) => {
            const isFuture = day > nextDayHalo;
            const isTaken = currentPack?.pills?.some(
              (pill: Pill) => pill.dayNumber === day,
            );
            const isNext = day === nextDayHalo;

            const className = [
              "pill-day",
              isTaken && "is-taken",
              isNext && "is-next",
              isFuture && "is-future",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <div
                onClick={() =>
                  !isFuture && setClickedCircle((prev) => (prev !== day ? day : prev))
                }
                key={day}
                className={className}
              >
                {day}
              </div>
            );
          })}
        </div>

        <div className="pill-actions">
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
        </div>
      </div>
    </div>
  );
}

export default PillPack;
