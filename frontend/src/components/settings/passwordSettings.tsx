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

const fields = [
  { label: "Old password", key: "oldPassword" },
  { label: "New password", key: "password" },
  { label: "Confirm password", key: "confirmPassword" },
];

function PasswordSettings() {
  const { accessToken, setAccessToken, setUser } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [editPassword, setEditPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    password: "",
    confirmPassword: "",
  });

  const {
    mutate: updatePassword,
    isPending: passwordUpdatePending,
    error: updatePasswordError,
  } = useMutation({
    ...updatePasswordMut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usersSettings"] });
      setEditPassword(false);
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.isAuthError()) {
        setShowLoginModal(true);
      }
    },
  });

  const noEmptyData = Object.values(passwordData).every((item) => item !== "");

  const handleSave = () => {
    updatePassword({
      accessToken,
      oldPassword: passwordData.oldPassword,
      newPassword: passwordData.newPassword,
      confirmNewPassword: passwordData.confirmNewPassword,
    });
  };

  const handleCancel = () => {
    setEditPassword(false);
    setPasswordData({
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
  };

  return (
    <>
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
      <Box>Password</Box>

      {updatePasswordError && !updatePasswordError.isAuthError() && (
        <ErrorDiv error={updatePasswordError.message} />
      )}

      {editPassword && (
        <Box>
          {fields.map((field) => (
            <Box key={field.key}>
              <TextField
                required
                type="password"
                id={`outlined-${field.key}`}
                label={field.label}
                value={passwordData[field.key as keyof typeof passwordData]}
                variant="outlined"
                onChange={(e) =>
                  setPasswordData({ ...passwordData, [field.key]: e.target.value })
                }
              />
            </Box>
          ))}
        </Box>
      )}

      <Box>
        {!editPassword && <button onClick={() => setEditPassword(true)}>edit</button>}
        {editPassword && (
          <>
            <button onClick={handleCancel}>cancel</button>
            <button onClick={handleSave} disabled={passwordUpdatePending || !noEmptyData}>
              save
            </button>
          </>
        )}
      </Box>
    </>
  );
}

export default PasswordSettings;
