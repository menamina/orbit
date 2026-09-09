import { queryOptions, mutationOptions } from "@tanstack/react-query";

import type {
  CycleMonthResponse,
  TrackCycleResponse,
  CycleDays,
} from "./cycleTypes";
import { apiFetch, ApiError, type AuthParams } from "./api";

export const getCycleByMonthYearQuery = (
  month: number,
  year: number,
  accessToken: string | null,
  onTokenRefresh: (token: string) => void,
) => {
  return queryOptions({
    queryKey: ["cycle", month, year],
    queryFn: () =>
      getCycleByMonthYear({ month, year, accessToken, onTokenRefresh }),
  });
};

export const trackCycleMut = () => {
  return mutationOptions({
    mutationFn: trackCycle,
  });
};

export const dltCycleMut = () => {
  return mutationOptions({
    mutationFn: dltCycle,
  });
};

// --------- API CALLS --------- \\

async function getCycleByMonthYear({
  month,
  year,
  accessToken,
  onTokenRefresh,
}: {
  month: number;
  year: number;
} & AuthParams): Promise<CycleMonthResponse> {
  const res = await apiFetch(
    `http://localhost:5555/api/cycle/${month}/${year}`,
    {
      accessToken,
      onTokenRefresh,
    },
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new ApiError(errorData.error, res.status, errorData.code);
  }

  return await res.json();
}

async function trackCycle({
  accessToken,
  onTokenRefresh,
  cycleDays,
}: AuthParams & CycleDays): Promise<TrackCycleResponse> {
  const res = await apiFetch(`http://localhost:5555/api/track/period`, {
    method: "POST",
    accessToken,
    onTokenRefresh,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cycleDays),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new ApiError(errorData.error, res.status, errorData.code);
  }

  return await res.json();
}

async function dltCycle({
  cycleID,
  accessToken,
  onTokenRefresh,
}: {
  cycleID: number;
} & AuthParams): Promise<{ success: boolean }> {
  const res = await apiFetch(`http://localhost:5555/api/cycle/${cycleID}`, {
    method: "DELETE",
    accessToken,
    onTokenRefresh,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new ApiError(errorData.error, res.status, errorData.code);
  }

  return await res.json();
}
