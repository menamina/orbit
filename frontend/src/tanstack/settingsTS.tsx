import { queryOptions, mutationOptions } from "@tanstack/react-query";
import type {
  SettingsType,
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

async function getSettings() {
  const res = await fetch(`http://localhost:5555/api/settings`, {
    method: "GET",
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
  updatedSettingsData: SettingsType,
): Promise<{ success: boolean }> {
  const res = await fetch(`http://localhost:5555/api/updateSettings`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedSettingsData),
  });

  if (!res.ok) {
    const errorData = await res.json();
    if (res.status === 400) {
      throw new Error("User does not exist");
    }
    if (res.status === 403) {
      throw new Error(errorData);
    }
    if (res.status === 500) {
      throw new Error("Cannot update settings, try again");
    }
  }
  return await res.json();
}

async function updatePassword(
  passwordUpdateData: PasswordUpdateType,
): Promise<{ success: boolean }> {
  const res = await fetch(`http://localhost:5555/api/updatePassword`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(passwordUpdateData),
  });

  if (!res.ok) {
    const errorData = await res.json();
    if (res.status === 400) {
      throw new Error(errorData);
    } else if (res.status === 500) {
      throw new Error("Cannot update password, try again");
    }
  }
  return await res.json();
}

async function getCycle() {
  const res = await fetch(`http://localhost:5555/api/getCycleInfo`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Cannot get cycle info, try again");
  }

  return await res.json();
}

async function updateCycle(
  cycleData: UpdateCycleType,
): Promise<{ success: boolean }> {
  const res = await fetch(`http://localhost:5555/api/updateCycleInfo`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cycleData),
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

async function dltAccount(): Promise<{ success: boolean }> {
  const res = await fetch(`http://localhost:5555/api/delete/account`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    if (res.status === 500) {
      throw new Error("Cannot delete account, try again");
    }
  }

  return await res.json();
}
