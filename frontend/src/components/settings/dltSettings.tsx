import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../authContext";

import { useMutation } from "@tanstack/react-query";
import { dltAccountMut } from "../../tanstack/settingsTS";

import { ApiError } from "../../tanstack/api";

import { Box } from "@mui/material";

import ErrorDiv from "../popups/errorDiv";
import ErrorModal from "../popups/errorModal";
import ConfirmModal from "../popups/confirmModal";

function DeleteSettings(setSettingsView) {
  const { accessToken, setAccessToken, setUser } = useAuth();
  const navigate = useNavigate();

  const [dltModal, setDltModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const {
    mutate: dltAccount,
    isPending: dltAccPending,
    error: dltAccountError,
  } = useMutation({
    ...dltAccountMut(),
    onSuccess: () => {
      setUser(null);
      setAccessToken(null);
      navigate("/login");
    },
    onError: (error) => {
      if (error instanceof ApiError && error.isAuthError()) {
        setShowLoginModal(true);
      }
    },
  });

  return (
    <>
      {dltModal && (
        <ConfirmModal
          message="Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost."
          onConfirm={() => {
            dltAccount({
              accessToken: accessToken,
              onTokenRefresh: setAccessToken,
            });
          }}
          onCancel={() => setDltModal(false)}
          isPending={dltAccPending}
          confirmText="Delete Account"
        />
      )}
      {showLoginModal && (
        <ErrorModal
          error="Your session expired. Please login again."
          onClose={() => {
            setAccessToken(null);
            setUser(null);
            navigate("/login");
          }}
        />
      )}
      {dltAccountError && !showLoginModal && (
        <ErrorDiv error={dltAccountError} />
      )}
      <Box>Delete Account</Box>
      <Box>
        Your account will be permanently deleted and everything associated with
        it will no longer be available to other users or yourself; once you
        delete your account there is no recovering it.
      </Box>
      <Box>
        <button
          type="button"
          className="settingsButtons"
          onClick={() => setSettingsView("main")}
        >
          cancel
        </button>
        <button
          type="button"
          className="settingsButtons"
          onClick={() => setDltModal(true)}
        >
          delete
        </button>
      </Box>
    </>
  );
}

export default DeleteSettings;
