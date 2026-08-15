import { queryOptions, mutationOptions } from "@tanstack/react-query";
import type {
  SettingsUpdateType,
  PasswordUpdateType,
  UpdateCycleType,
} from "./settingsTypes";

export const getSettingsQuery = () => {
  return queryOptions({
    queryKey: ["usersSettings"],
    queryFn: () => getSettings(),
  });
};

export const updateSettingsMut = () => {
  return mutationOptions({
    mutationFn: updateSettings,
  });
};

export const updatePasswordMut = () => {
  return mutationOptions({
    mutationFn: updatePassword,
  });
};

export const getCycleQuery = () => {
  return queryOptions({
    queryKey: ["usersCycle"],
    queryFn: () => getCycle(),
  });
};

export const updateCycleMut = () => {};

// --------- API CALLS --------- \\

async function getSettings() {
  const res = await fetch(`http://localhost:5555//api/settings`, {
    method: "GET",
    credentials: "include",
  });
}

async function updateSettings() {}

async function getCycle() {
  const res = await fetch(`http://localhost:5555//api/getCycleInfo`, {
    method: "GET",
    credentials: "include",
  });
}
