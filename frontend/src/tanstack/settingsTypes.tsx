export type SettingsUpdateType = {
  name: string;
  username: string;
  email: string;
};

export type PasswordUpdateType = {
  oldpassword: string;
  password: string;
  confirmPassword: string;
};

export type UpdateCycleType = {
  cycleLength: number;
  daysBetwenPeriod: number;
};
