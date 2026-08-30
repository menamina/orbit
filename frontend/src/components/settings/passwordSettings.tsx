import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../authContext";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePasswordMut } from "../../tanstack/settingsTS";

import { ApiError } from "../../tanstack/api";

import { Box, Paper, Button } from "@mui/material";

import ErrorDiv from "../popups/errorDiv";
import ErrorModal from "../popups/errorModal";

function PasswordSettings() {
  const { accessToken, setAccessToken, setUser } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [showLoginModal, setShowLoginModal] = useState(false);

  const {
    mutate: updatePassword,
    isPending: passwordUpdatePending,
    error: updatePasswordError,
  } = useMutation({
    ...updatePasswordMut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usersSettings"] });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.isAuthError()) {
        setShowLoginModal(true);
      }
    },
  });

  return (
    <>
      <Box>Password</Box>
      <Box>Box</Box>
    </>
  );
}

export default PasswordSettings;
