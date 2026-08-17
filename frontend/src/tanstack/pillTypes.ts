export type PillPack = {
  id: number;
  userID: number;
  packNumber: number;
  startDate: string;
  endDate?: string;
  isComplete: boolean;
  startDayOfWeek: string;
  pills: Pill[];
};

export type Pill = {
  id: number;
  pillPackID: number;
  dayNumber: number;
  date: string;
};
