import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../authContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCurrentPackQuery,
  startNewPackMut,
  dltPackMut,
} from "../../tanstack/pillTS";
import { ApiError } from "../../tanstack/api";

import PillPack from "./pillPack";

import ErrorDiv from "../popups/errorDiv";
import ErrorModal from "../popups/errorModal";
import ConfirmModal from "../popups/confirmModal";
import type { ConfirmModalProps } from "../popups/confirmModal";
import Dots from "../../imgs/dotsVert.svg";

import "../../styles/pill.css";

function PillComponent() {
  const { accessToken, setAccessToken, setUser } = useAuth();
  const navigate = useNavigate();
  const [dayOfTheWeekToStart, setDayOfTheWeekToStart] = useState("sun");
  const [openDots, setOpenedDots] = useState(false);
  const [displayDltModal, setDisplayDltModal] = useState(false);

  const queryClient = useQueryClient();

  const weekdays = ["sun", "mon", "tues", "wed", "thur", "fri", "sat"];

  const { data: currentPack, error: getCurrentPackError } = useQuery({
    ...getCurrentPackQuery(accessToken, setAccessToken),
    retry: false,
    enabled: !!accessToken,
  });

  const {
    mutate: startPackMutation,
    error: startingPackError,
    isPending: newPackPending,
  } = useMutation({
    ...startNewPackMut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentPack"] });
    },
  });

  const {
    mutate: dltPack,
    error: dltingPackError,
    isPending: dltingPackPending,
  } = useMutation({
    ...dltPackMut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentPack"] });
      setDisplayDltModal(false);
      setOpenedDots(false);
    },
  });

  const effectiveDayOfWeek = currentPack?.startDayOfWeek || dayOfTheWeekToStart;

  const deletePackModalProps: ConfirmModalProps = {
    message: "Are you sure you want to delete this pack?",
    onConfirm: () => {
      dltPack({
        packID: currentPack!.id,
        accessToken: accessToken,
        onTokenRefresh: setAccessToken,
      });
    },
    onCancel: () => {
      setOpenedDots(false);
      setDisplayDltModal(false);
    },
    isPending: dltingPackPending,
  };

  return (
    <div className="pillComp">
      {((startingPackError instanceof ApiError &&
        startingPackError.isAuthError()) ||
        (dltingPackError instanceof ApiError &&
          dltingPackError.isAuthError()) ||
        (getCurrentPackError instanceof ApiError &&
          getCurrentPackError.isAuthError())) && (
        <ErrorModal
          error="Your session expired. Please login again."
          onClose={() => {
            setAccessToken(null);
            setUser(null);
            navigate("/login");
          }}
        />
      )}
      {startingPackError && <ErrorDiv error={startingPackError} />}
      {dltingPackError && <ErrorDiv error={dltingPackError} />}
      {getCurrentPackError && <ErrorDiv error={getCurrentPackError.message} />}
      {!currentPack || currentPack?.pills?.length === 0 ? (
        <div className="pill-card">
          <p style={{ textAlign: "center", marginBottom: "1rem", fontSize: "0.95rem", color: "var(--text)" }}>
            Pick a day to start your new pack
          </p>
          <div className="pill-weekdays" style={{ marginBottom: "1rem" }}>
            {weekdays.map((day) => {
              const isSelected = dayOfTheWeekToStart === day;
              const className = [
                "pill-weekday",
                isSelected && "is-selected",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <div
                  key={day}
                  onClick={() => setDayOfTheWeekToStart(day)}
                  className={className}
                  style={{
                    cursor: "pointer",
                    padding: "0.75rem 0.5rem",
                    backgroundColor: isSelected ? "var(--accent)" : "var(--surface)",
                    color: isSelected ? "#fff" : "var(--text)",
                    borderRadius: "var(--radius)",
                    fontWeight: isSelected ? "600" : "500",
                    transition: "all 0.15s ease",
                  }}
                >
                  {day}
                </div>
              );
            })}
          </div>
          <div className="pill-actions">
            <button
              onClick={() =>
                startPackMutation({
                  startDayOfWeek: dayOfTheWeekToStart,
                  accessToken,
                  onTokenRefresh: setAccessToken,
                })
              }
              disabled={newPackPending}
            >
              {newPackPending ? "Starting..." : "Start Pack"}
            </button>
          </div>
          <div style={{ marginTop: "1.5rem" }}>
            <PillPack
              currentPack={currentPack}
              dayOfTheWeekToStart={dayOfTheWeekToStart}
            />
          </div>
        </div>
      ) : (
        <>
          <PillPack
            currentPack={currentPack}
            dayOfTheWeekToStart={effectiveDayOfWeek}
          />
          <div style={{ textAlign: "center" }}>
            <img
              src={Dots}
              alt="3 dots"
              onClick={() => setOpenedDots(true)}
            />
            {openDots && (
              <div className="dots-menu">
                <button onClick={() => setDisplayDltModal(true)}>
                  delete current pack
                </button>
                <button onClick={() => setOpenedDots(false)}>
                  cancel
                </button>
              </div>
            )}
          </div>
        </>
      )}
      {displayDltModal && <ConfirmModal {...deletePackModalProps} />}
    </div>
  );
}

export default PillComponent;
