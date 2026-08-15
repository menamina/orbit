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
}

async function takePill(date: number) {}

async function dltPillMut(pillID: number) {}
