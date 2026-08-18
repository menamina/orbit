import {
  queryOptions,
  mutationOptions,
  infiniteQueryOptions,
} from "@tanstack/react-query";

import type { PillPack, Pill } from "./pillTypes";
import { apiFetch, type AuthParams } from "./api";

export const getCurrentPackQuery = (
  accessToken: string | null,
  onTokenRefresh: (token: string) => void,
) => {
  return queryOptions({
    queryKey: ["currentPack"],
    queryFn: () => getCurrentPack({ accessToken, onTokenRefresh }),
  });
};

export const getAllPillPacksQuery = (
  accessToken: string | null,
  onTokenRefresh: (token: string) => void,
) => {
  return infiniteQueryOptions({
    queryKey: ["allPacks"],
    queryFn: ({ pageParam }) =>
      getAllPillPacks({ pageParam, accessToken, onTokenRefresh }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
};

export const getSpecificPillPackQuery = (
  packID: number,
  packNumber: number,
  accessToken: string | null,
  onTokenRefresh: (token: string) => void,
) => {
  return queryOptions({
    queryKey: ["specificPack", packID, packNumber],
    queryFn: () =>
      getSpecificPillPack({ packID, packNumber, accessToken, onTokenRefresh }),
  });
};

export const startNewPackMut = () => {
  return mutationOptions({
    mutationFn: startNewPack,
  });
};

export const trackPillInPackMut = () => {
  return mutationOptions({
    mutationFn: trackPillInPack,
  });
};

export const dltPillMut = () => {
  return mutationOptions({
    mutationFn: dltPill,
  });
};

export const dltPackMut = () => {
  return mutationOptions({
    mutationFn: dltPack,
  });
};

// --------- API CALLS --------- \\

async function getCurrentPack({
  accessToken,
  onTokenRefresh,
}: AuthParams): Promise<PillPack> {
  const res = await apiFetch(`/api/pill-pack/current`, {
    accessToken,
    onTokenRefresh,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error);
  }

  return await res.json();
}

async function getAllPillPacks({
  pageParam,
  accessToken,
  onTokenRefresh,
}: { pageParam: number } & AuthParams): Promise<{
  packs: PillPack[];
  nextCursor?: number;
}> {
  const res = await apiFetch(
    `http://localhost:5555/api/all-packs?cursor=${pageParam}`,
    {
      accessToken,
      onTokenRefresh,
    },
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error);
  }

  return await res.json();
}

async function getSpecificPillPack({
  packID,
  packNumber,
  accessToken,
  onTokenRefresh,
}: { packID: number } & {
  packNumber: number;
} & AuthParams): Promise<PillPack> {
  const res = await apiFetch(`/api/pill-pack/${packID}/${packNumber}`, {
    accessToken,
    onTokenRefresh,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error);
  }

  return await res.json();
}

async function startNewPack({
  startDayOfWeek,
  accessToken,
  onTokenRefresh,
}: { startDayOfWeek: string } & AuthParams): Promise<PillPack> {
  const res = await apiFetch(`http://localhost:5555/api/new-blister-packs`, {
    method: "POST",
    accessToken,
    onTokenRefresh,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ startDayOfWeek }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error);
  }

  return await res.json();
}

async function trackPillInPack({
  packID,
  dayNumber,
  date,
  accessToken,
  onTokenRefresh,
}: {
  packID: number;
  dayNumber: number;
  date: number;
} & AuthParams): Promise<Pill> {
  const res = await apiFetch(`http://localhost:5555/api/track-pill/${packID}`, {
    method: "POST",
    accessToken,
    onTokenRefresh,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ dayNumber, date }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error);
  }

  return await res.json();
}

async function dltPill({
  pillID,
  accessToken,
  onTokenRefresh,
}: { pillID: number } & AuthParams): Promise<{ success: boolean }> {
  const res = await apiFetch(`http://localhost:5555/api/dltPill/${pillID}`, {
    method: "DELETE",
    accessToken,
    onTokenRefresh,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error);
  }

  return await res.json();
}

async function dltPack({
  packID,
  accessToken,
  onTokenRefresh,
}: { packID: number } & AuthParams): Promise<{ success: boolean }> {
  const res = await apiFetch(`http://localhost:5555/api/dltPack/${packID}`, {
    method: "DELETE",
    accessToken,
    onTokenRefresh,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error);
  }

  return await res.json();
}
