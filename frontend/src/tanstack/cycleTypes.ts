export type CycleTracking = {
  id: number;
  userID: number;
  startDate: string;
  estimateEndDate?: string | null;
  endDate?: string | null;
};

export type TrackCycleResponse = CycleTracking & {
  isNewCycle: boolean;
  ovulationPrediction?: number;
};
