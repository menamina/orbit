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

import ErrorDiv from "../errorComps/errorDiv";
import ErrorModal from "../errorComps/errorModal";

function Settings() {}

export default Settings;
