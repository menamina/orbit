import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../authContext";

import { useMutation } from "@tanstack/react-query";
import { dltAccountMut } from "../../tanstack/settingsTS";

import { ApiError } from "../../tanstack/api";

import { Box, Paper, Button } from "@mui/material";

import ErrorDiv from "../popups/errorDiv";
import ErrorModal from "../popups/errorModal";
import ConfirmModal from "../popups/confirmModal";

function DeleteSettings(setSettingsView: (view: string) => void) {
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
      <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <Paper sx={{ padding: "20px" }}>
          <Box
            sx={{
              fontSize: "24px",
              fontWeight: "600",
              marginBottom: "15px",
              color: "#d32f2f",
            }}
          >
            Delete Account
          </Box>
          <Box sx={{ color: "#666", lineHeight: "1.6" }}>
            Your account will be permanently deleted and everything associated
            with it will no longer be available to other users or yourself; once
            you delete your account there is no recovering it.
          </Box>
        </Paper>
        <Box sx={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            onClick={() => setSettingsView("main")}
            sx={{
              color: "#1b1a61",
              borderColor: "#1b1a61",
              "&:hover": {
                borderColor: "#151349",
                bgcolor: "rgba(27, 26, 97, 0.04)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => setDltModal(true)}
            sx={{
              bgcolor: "#d32f2f",
              "&:hover": {
                bgcolor: "#c62828",
              },
            }}
          >
            Delete Account
          </Button>
        </Box>
      </Box>
    </>
  );
}

export default DeleteSettings;
