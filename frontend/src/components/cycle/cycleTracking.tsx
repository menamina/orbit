import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../authContext";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCycleByMonthYearQuery } from "../../tanstack/cycleTS";

import { ApiError } from "../../tanstack/api";
import type { SettingsType } from "../tanstack/SettingsType";

import { Box, TextField } from "@mui/material";

import ErrorDiv from "../popups/errorDiv";
import ErrorModal from "../popups/errorModal";
import IconOptions from "./iconOptions";

const today = new Date();
const month = 
const year = today.getFullYear();



function CycleCalendar() {


}

export default CycleCalendar;
