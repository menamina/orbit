import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../authContext";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePasswordMut } from "../../tanstack/settingsTS";

import { ApiError } from "../../tanstack/api";

import { Box, Paper, Button } from "@mui/material";
import TextField from "@mui/material/TextField";

import ErrorDiv from "../popups/errorDiv";
import ErrorModal from "../popups/errorModal";

const labels = ["Old password", "New passowrd", "Confirm new password"];

function PasswordSettings() {
  const { accessToken, setAccessToken, setUser } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword:"",
    confirmNewPassword: ""
  })

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
      <Box>
        {labels.map((label) => (
          <Box>
            <TextField
              required
              id={label}
              label={label}
              variant="standard"
              onChange={(e) => }
            />
          </Box>
        ))}
      </Box>
    </>
  );
}

export default PasswordSettings;
