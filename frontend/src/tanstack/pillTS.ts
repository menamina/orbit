import {
  queryOptions,
  mutationOptions,
  infiniteQueryOptions,
} from "@tanstack/react-query";

import type { PillPack, Pill } from "./pillTypes";
import { apiFetch, type AuthParams } from "./api";

export const getCurrentPackQuery = (
  accessToken: string,
  onTokenRefresh: (token: string) => void,
) => {
  return queryOptions({
    queryKey: ["currentPack"],
    queryFn: () => getCurrentPack({ accessToken, onTokenRefresh }),
  });
};

export const getAllPillPacksQuery = (
  accessToken: string,
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
  packID,
  packNumber,
  accessToken: string,
  onTokenRefresh: (token: string) => void,
) => {
  return queryOptions({
    queryKey: ["currentPack"],
    queryFn: () =>
      getCurrentPack({ packID, packNumber, accessToken, onTokenRefresh }),
  });
};

export const takePillMut = () => {
  return mutationOptions({
    mutationFn: takePill,
  });
};

export const dltPillMut = () => {
  return mutationOptions({
    mutationFn: dltPill,
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

async function takePill({
  date,
  accessToken,
  onTokenRefresh,
}: { date: number } & AuthParams): Promise<Pill> {
  const res = await apiFetch(`http://localhost:5555/api/track/pill`, {
    method: "POST",
    accessToken,
    onTokenRefresh,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ date }),
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
