import { queryOptions, mutationOptions } from "@tanstack/react-query";

import type {
  BlisterMonthYear,
  MonthOfPills,
  PillTracking,
} from "./pillTypes";
import { apiFetch, type AuthParams } from "../utils/api";

export const getBlisterQuery = (
  thisMonth: BlisterMonthYear,
  accessToken: string,
  onTokenRefresh?: (token: string) => void
) => {
  return queryOptions({
    queryKey: ["blisterMonth", thisMonth],
    queryFn: () => getBlisterThisMonth(thisMonth, { accessToken, onTokenRefresh }),
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

async function getBlisterThisMonth(
  thisMonth: BlisterMonthYear,
  { accessToken, onTokenRefresh }: AuthParams
): Promise<MonthOfPills> {
  const res = await apiFetch(
    `http://localhost:5555/api/pill/${thisMonth.month}/${thisMonth.year}`,
    {
      accessToken,
      onTokenRefresh,
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Cannot get pills, try again");
  }

  return await res.json();
}

async function takePill({
  date,
  accessToken,
  onTokenRefresh,
}: { date: number } & AuthParams): Promise<PillTracking> {
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
    throw new Error(errorData.error || "Cannot track pill, try again");
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
    throw new Error(errorData.error || "Cannot delete pill, try again");
  }

  return await res.json();
}
