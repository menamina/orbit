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

export const updateSettingsMut = () => {};

export const updateCycleMut = () => {};

export const updatePasswordMut = {};

export const updateIconMut = {};

export const updateAppColorMut = {};

export const getCycleQuery = () => {
  return queryOptions({
    queryKey: ["usersCycle"],
    queryFn: () => getCycle(),
  });
};

async function getSettings() {
  const res = await fetch(`http://localhost:5555//api/settings`, {
    method: "GET",
    credentials: "include",
  });
}

async function getCycle() {
  const res = await fetch(`http://localhost:5555//api/getCycleInfo`, {
    method: "GET",
    credentials: "include",
  });
}
