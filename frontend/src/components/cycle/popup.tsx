import Note from "../notes/writeOrEditNote";

import { useAuth } from "../../authContext";

import { useNavigate } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";
import { getNoteByDayQuery } from "../../tanstack/notesTS";

import dayjs from "dayjs";
import Close from "../../imgs/closeArrow.svg";

import { ApiError } from "../../tanstack/api";

import { Modal } from "@mui/material";

import ErrorDiv from "../popups/errorDiv";
import ErrorModal from "../popups/errorModal";

type PopupType = {
  date: string;
  onClose: () => void;
  onEditPeriod: () => void;
};

function NoteCyclePopUp({ date, onClose, onEditPeriod }: PopupType) {
  const { accessToken, setAccessToken, setUser } = useAuth();
  const navigate = useNavigate();

  const {
    data: selectedDayNote,
    isPending: notePending,
    error: noteError,
  } = useQuery({
    ...getNoteByDayQuery(date, accessToken, setAccessToken),
    retry: false,
  });

  return (
    <>
      {noteError instanceof ApiError && noteError.isAuthError() && (
        <ErrorModal
          error="Your session expired. Please login again."
          onClose={() => {
            setAccessToken(null);
            setUser(null);
            navigate("/login");
          }}
        />
      )}

      <Modal open onClose={onClose}>
        <div className="cycle-popup" role="dialog" aria-label={date}>
          <div className="cycle-popup-header">
            <div>
              <div className="cycle-popup-weekday">
                {dayjs(date).format("dddd")}
              </div>
              <div className="cycle-popup-date">
                {dayjs(date).format("MMMM D, YYYY")}
              </div>
            </div>
            <button className="icon-btn" onClick={onClose} aria-label="close">
              <img src={Close} alt="" />
            </button>
          </div>

          {noteError && !(noteError instanceof ApiError && noteError.isAuthError()) && (
            <ErrorDiv error={noteError} />
          )}

          <div className="cycle-popup-body">
            {notePending ? (
              <div className="cycle-popup-loading">Loading…</div>
            ) : (
              <Note
                noteData={
                  selectedDayNote && !Array.isArray(selectedDayNote)
                    ? { id: selectedDayNote.id, note: selectedDayNote.note }
                    : null
                }
                date={date}
              />
            )}
          </div>

          <div className="cycle-popup-footer">
            <button className="btn btn-soft" onClick={onEditPeriod}>
              Edit period days
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default NoteCyclePopUp;
