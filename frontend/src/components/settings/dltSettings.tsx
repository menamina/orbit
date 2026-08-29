import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../authContext";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dltAccountMut } from "../../tanstack/settingsTS";

import { ApiError } from "../../tanstack/api";

import { Box, Paper, Button } from "@mui/material";

import ErrorDiv from "../errorComps/errorDiv";
import ErrorModal from "../errorComps/errorModal";

function DeleteSettings() {
  const { accessToken, setAccessToken, setUser } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
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
}

export default DeleteSettings;
