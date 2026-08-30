import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../authContext";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dltAccountMut } from "../../tanstack/settingsTS";

import { ApiError } from "../../tanstack/api";

import { Box, Paper, Button } from "@mui/material";

import ErrorDiv from "../errorComps/errorDiv";
import ErrorModal from "../errorComps/errorModal";

function DeleteSettings(setSettingsView) {
  const { accessToken, setAccessToken, setUser } = useAuth();
  const queryClient = useQueryClient();
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
