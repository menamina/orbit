export type BlisterMonthYear = {
  month: number;
  year: number;
};

export type MonthOfPills = PillTracking[];

export type PillTracking = {
  id: number;
  userID: number;
  date: string;
};
