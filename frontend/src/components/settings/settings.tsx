import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../authContext";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSettingsQuery,
  updateSettingsMut,
  updatePasswordMut,
  getCycleQuery,
  updateCycleMut,
  dltAccountMut,
} from "../../tanstack/settingsTS";

import { ApiError } from "../../tanstack/api";

import { Box, Paper, Button } from "@mui/material";

import ErrorDiv from "../errorComps/errorDiv";
import ErrorModal from "../errorComps/errorModal";

import MainSettings from "./mainSettings";
import PasswordSettings from "./passwordSettings";
import DeleteSettings from "./dltSettings";

type Views = "main" | "password" | "delete";

function Settings() {
  const { accessToken, setAccessToken, setUser } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [view, setView] = useState<Views>("main");

  const [displayDltModal, setDisplayDltModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { data: userSettings, error: getSettingsError } = useQuery(
    getSettingsQuery(accessToken, setAccessToken),
  );

  const { data: cycleData, error: getCycleDataError } = useQuery(
    getCycleQuery(accessToken, setAccessToken),
  );

  const {
    mutate: updateSettings,
    isPending: settingsUpdatePending,
    error: updateSettingsError,
  } = useMutation({
    ...updateSettingsMut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSettings"] });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.isAuthError()) {
        setShowLoginModal(true);
      }
    },
  });

  const {
    mutate: updatePassword,
    isPending: passwordUpdatePending,
    error: updatePasswordError,
  } = useMutation({
    ...updatePasswordMut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSettings"] });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.isAuthError()) {
        setShowLoginModal(true);
      }
    },
  });

  const {
    mutate: updateCycle,
    isPending: cycleUpdatePending,
    error: updateCycleError,
  } = useMutation({
    ...updateCycleMut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSettings"] });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.isAuthError()) {
        setShowLoginModal(true);
      }
    },
  });

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
      <Box>Settings</Box>
      {view === "main" && <MainSettings />}
      {view === "password" && <PasswordSettings />}
      {view === "password" && <DeleteSettings />}
    </>
  );
}

export default Settings;
