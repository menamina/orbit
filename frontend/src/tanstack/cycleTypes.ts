export type CycleDays = {
  id?: number;
  date: string;
};

export type CycleSettings = {
  ovulationPrediction: number;
  daysBetweenPeriod: number;
  cycleLength: number;
};

export type CycleMonthResponse = {
  cycleDays: CycleDays[];
  settings: CycleSettings | null;
  ovulationDates: number[];
};

export type TrackCycleResponse = CycleDay;
