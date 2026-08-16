import { queryOptions, mutationOptions } from "@tanstack/react-query";
import type {
  SettingsType,
  PasswordUpdateType,
  UpdateCycleType,
} from "./settingsTypes";
import { apiFetch, type AuthParams } from "../utils/api";

export const getSettingsQuery = (
  accessToken: string,
  onTokenRefresh?: (token: string) => void
) => {
  return queryOptions({
    queryKey: ["usersSettings"],
    queryFn: () => getSettings({ accessToken, onTokenRefresh }),
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

export const getCycleQuery = (
  accessToken: string,
  onTokenRefresh?: (token: string) => void
) => {
  return queryOptions({
    queryKey: ["usersCycle"],
    queryFn: () => getCycle({ accessToken, onTokenRefresh }),
  });
};

export const updateCycleMut = () => {
  return mutationOptions({
    mutationFn: updateCycle,
  });
};

export const dltAccountMut = () => {
  return mutationOptions({
    mutationFn: dltAccount,
  });
};

// --------- API CALLS --------- \\

async function getSettings({
  accessToken,
  onTokenRefresh,
}: AuthParams) {
  const res = await apiFetch(`http://localhost:5555/api/settings`, {
    accessToken,
    onTokenRefresh,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Cannot get settings, try again");
  }

  return await res.json();
}

async function updateSettings({
  accessToken,
  onTokenRefresh,
  ...data
}: SettingsType & AuthParams): Promise<{ success: boolean }> {
  const res = await apiFetch(`http://localhost:5555/api/updateSettings`, {
    method: "PATCH",
    accessToken,
    onTokenRefresh,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Cannot update settings, try again");
  }
  return await res.json();
}

async function updatePassword({
  accessToken,
  onTokenRefresh,
  ...data
}: PasswordUpdateType & AuthParams): Promise<{ success: boolean }> {
  const res = await apiFetch(`http://localhost:5555/api/updatePassword`, {
    method: "PATCH",
    accessToken,
    onTokenRefresh,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Cannot update password, try again");
  }
  return await res.json();
}

async function getCycle({
  accessToken,
  onTokenRefresh,
}: AuthParams) {
  const res = await apiFetch(`http://localhost:5555/api/getCycleInfo`, {
    accessToken,
    onTokenRefresh,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Cannot get cycle info, try again");
  }

  return await res.json();
}

async function updateCycle({
  accessToken,
  onTokenRefresh,
  ...data
}: UpdateCycleType & AuthParams): Promise<{ success: boolean }> {
  const res = await apiFetch(`http://localhost:5555/api/updateCycleInfo`, {
    method: "PATCH",
    accessToken,
    onTokenRefresh,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || errorData.message || "Cannot update cycle info, try again");
  }

  return await res.json();
}

async function dltAccount({
  accessToken,
  onTokenRefresh,
}: AuthParams): Promise<{ success: boolean }> {
  const res = await apiFetch(`http://localhost:5555/api/delete/account`, {
    method: "DELETE",
    accessToken,
    onTokenRefresh,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Cannot delete account, try again");
  }

  return await res.json();
}
