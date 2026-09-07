export type CycleTracking = {
  id: number;
  userID: number;
  startDate: string;
  estimateEndDate?: string | null;
  endDate?: string | null;
};

export type CycleSettings = {
  ovulationPrediction: number;
  daysBetweenPeriod: number;
  cycleLength: number;
};

export type CycleMonthResponse = {
  cycleTracking: CycleTracking[];
  settings: CycleSettings | null;
};

export type TrackCycleResponse = CycleTracking & {
  isNewCycle: boolean;
  ovulationPrediction?: number;
};
