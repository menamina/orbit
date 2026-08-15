export type SettingsType = {
  name: string;
  username: string;
  email: string;
  icon: string;
  appColor: string;
};

export type PasswordUpdateType = {
  oldPassword: string;
  password: string;
  confirmPassword: string;
};

export type UpdateCycleType = {
  cycleLength: number;
  daysBetweenPeriod: number;
};
