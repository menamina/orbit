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
  const [editPassword, setEditPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [showLabelPassword, setShowLabelPassword] = useState({
    old: false,
    new: false,
    confirmNew: false,
  });

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

  const noEmptyData = Object.values(passwordData).every((item) => item !== "");

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

      {!editPassword && (
        <Box>
          {labels.map((label) => (
            <TextField
              disabled
              key={label}
              placeholder="•••"
              variant="outlined"
            />
          ))}
        </Box>
      )}

      {editPassword && (
        <Box>
          {labels.map((index, label) => (
            <Box key={label}>
              <TextField
                required
                type={showLabelPassword[index] === false ? "password" : "text"}
                id={`outlined-${label}`}
                label={label}
                variant="outlined"
                onChange={(e) =>
                  setPasswordData({ ...passwordData, [label]: e.target.value })
                }
              />
              {Object.entries(showLabelPassword).map(([key]) => (
                <Box
                  key={key}
                  onClick={() =>
                    setShowLabelPassword((prev) => ({
                      ...prev,
                      [key]: !prev[key as keyof typeof prev],
                    }))
                  }
                >
                  <img src="" alt="" />
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      )}
      <Box>
        {!editPassword && <button>edit</button>}
        {editPassword && (
          <>
            <button onClick={() => setEditPassword(false)}>cancel</button>
            <button disabled={passwordUpdatePending || !noEmptyData}>
              save
            </button>
          </>
        )}
      </Box>
    </>
  );
}

export default PasswordSettings;
