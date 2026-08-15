export type SettingsType = {
  name: string;
  username: string;
  email: string;
  icon: string;
  appColor: string;
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
