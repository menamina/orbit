import { queryOptions, mutationOptions } from "@tanstack/react-query";

import type {
  BlisterMonthYear,
  MonthOfPills,
  PillTracking,
} from "./pillTypes";

export const getBlisterQuery = (thisMonth: BlisterMonthYear, accessToken: string) => {
  return queryOptions({
    queryKey: ["blisterMonth", thisMonth],
    queryFn: () => getBlisterThisMonth(thisMonth, accessToken),
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
  accessToken: string,
): Promise<MonthOfPills> {
  const res = await fetch(
    `http://localhost:5555/api/pill/${thisMonth.month}/${thisMonth.year}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    },
  );

  if (!res.ok) {
    const errorData = await res.json();
    if (res.status === 401) {
      throw new Error(errorData.error);
    } else if (res.status === 500) {
      throw new Error("Cannot get settings, try again");
    }
  }

  return await res.json();
}

async function takePill(params: { date: number; accessToken: string }): Promise<PillTracking> {
  const { date, accessToken } = params;
  const res = await fetch(`http://localhost:5555/api/track/pill`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ date }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    if (res.status === 401) {
      throw new Error(errorData.error);
    } else if (res.status === 500) {
      throw new Error("Cannot get settings, try again");
    }
  }

  return await res.json();
}

async function dltPill(params: { pillID: number; accessToken: string }): Promise<{ success: boolean }> {
  const { pillID, accessToken } = params;
  const res = await fetch(`http://localhost:5555/api/dltPill/${pillID}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
  });

  if (!res.ok) {
    const errorData = await res.json();
    if (res.status === 401) {
      throw new Error(errorData.error);
    } else if (res.status === 500) {
      throw new Error("Cannot get settings, try again");
    }
  }

  return await res.json();
}
