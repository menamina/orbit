import { queryOptions, mutationOptions } from "@tanstack/react-query";
import type { SettingsType, PasswordUpdateType } from "./settingsTypes";
import { apiFetch, ApiError, type AuthParams } from "./api";

export const getSettingsQuery = (
  accessToken: string | null,
  onTokenRefresh?: (token: string) => void,
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

export const dltAccountMut = () => {
  return mutationOptions({
    mutationFn: dltAccount,
  });
};

// --------- API CALLS --------- \\

async function getSettings({ accessToken, onTokenRefresh }: AuthParams) {
  const res = await apiFetch(`http://localhost:5555/api/settings`, {
    accessToken,
    onTokenRefresh,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new ApiError(
      errorData.error || "Cannot get settings, try again",
      res.status,
      errorData.code,
    );
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
    throw new ApiError(
      errorData.error || "Cannot update settings, try again",
      res.status,
      errorData.code,
    );
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
    throw new ApiError(
      errorData.error || "Cannot update password, try again",
      res.status,
      errorData.code,
    );
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
    throw new ApiError(
      errorData.error || "Cannot delete account, try again",
      res.status,
      errorData.code,
    );
  }

  return await res.json();
}
