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

function MainSettings() {
  const { accessToken, setAccessToken, setUser } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [showLoginModal, setShowLoginModal] = useState(false);

  const { data: userSettings, error: getSettingsError } = useQuery(
    getSettingsQuery(accessToken, setAccessToken),
  );
}
// icon option pop up on side

export default MainSettings;
