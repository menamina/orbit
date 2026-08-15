import { queryOptions, mutationOptions } from "@tanstack/react-query";
import type {
  SettingsType,
  PasswordUpdateType,
  UpdateCycleType,
} from "./settingsTypes";

export const getSettingsQuery = (accessToken: string) => {
  return queryOptions({
    queryKey: ["usersSettings"],
    queryFn: () => getSettings(accessToken),
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

export const getCycleQuery = (accessToken: string) => {
  return queryOptions({
    queryKey: ["usersCycle"],
    queryFn: () => getCycle(accessToken),
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

async function getSettings(accessToken: string) {
  const res = await fetch(`http://localhost:5555/api/settings`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
  });

  if (!res.ok) {
    if (res.status === 400) {
      throw new Error("User does not exist");
    } else if (res.status === 500) {
      throw new Error("Cannot get settings, try again");
    }
  }

  return await res.json();
}

async function updateSettings(
  params: { data: SettingsType; accessToken: string }
): Promise<{ success: boolean }> {
  const res = await fetch(`http://localhost:5555/api/updateSettings`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.accessToken}`,
    },
    body: JSON.stringify(params.data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    if (res.status === 400) {
      throw new Error("User does not exist");
    }
    if (res.status === 403) {
      throw new Error(errorData.error);
    }
    if (res.status === 500) {
      throw new Error("Cannot update settings, try again");
    }
  }
  return await res.json();
}

async function updatePassword(
  params: { data: PasswordUpdateType; accessToken: string }
): Promise<{ success: boolean }> {
  const res = await fetch(`http://localhost:5555/api/updatePassword`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.accessToken}`,
    },
    body: JSON.stringify(params.data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    if (res.status === 400) {
      throw new Error(errorData.error);
    } else if (res.status === 500) {
      throw new Error("Cannot update password, try again");
    }
  }
  return await res.json();
}

async function getCycle(accessToken: string) {
  const res = await fetch(`http://localhost:5555/api/getCycleInfo`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Cannot get cycle info, try again");
  }

  return await res.json();
}

async function updateCycle(
  params: { data: UpdateCycleType; accessToken: string }
): Promise<{ success: boolean }> {
  const res = await fetch(`http://localhost:5555/api/updateCycleInfo`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.accessToken}`,
    },
    body: JSON.stringify(params.data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    if (res.status === 400 || res.status === 403) {
      throw new Error(errorData.message);
    } else if (res.status === 500) {
      throw new Error("Cannot update cycle info, try again");
    }
  }

  return await res.json();
}

async function dltAccount(accessToken: string): Promise<{ success: boolean }> {
  const res = await fetch(`http://localhost:5555/api/delete/account`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
  });

  if (!res.ok) {
    if (res.status === 500) {
      throw new Error("Cannot delete account, try again");
    }
  }

  return await res.json();
}
