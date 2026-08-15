import { queryOptions, mutationOptions } from "@tanstack/react-query";

import type { BlisterMonthYear } from "./pillTypes";

export const getBlisterQuery = (thisMonth: BlisterMonthYear) => {
  return queryOptions({
    queryFn: ["blisterMonth", thisMonth],
    queryFn: () => getBlisterThisMonth(thisMonth),
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

async function getBlisterThisMonth(thisMonth: BlisterMonthYear) {
  const res = await fetch(
    `http://localhost:5555/api/pill/${thisMonth.month}/${thisMonth.year}`,
    {
      method: "GET",
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

async function takePill(date: number) {
  const res = await fetch(`http://localhost:5555/api/track/pill`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(date),
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

async function dltPill(pillID: number) {
  const res = await fetch(`http://localhost:5555/api/dltPill/${pillID}`, {
    method: "DELETE",
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
