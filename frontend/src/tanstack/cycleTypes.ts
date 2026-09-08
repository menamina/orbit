export type CycleDay = {
  id: number;
  userID: number;
  date: string;
};

export type CycleSettings = {
  ovulationPrediction: number;
  daysBetweenPeriod: number;
  cycleLength: number;
};

export type CycleMonthResponse = {
  cycleDays: CycleDay[];
  settings: CycleSettings | null;
  ovulationDates: number[];
};

export type TrackCycleResponse = CycleDay;
