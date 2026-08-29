export type SettingsType = {
  name: string;
  username: string;
  email: string;
  icon: string;
  cycleLength?: number;
  daysBetweenPeriod?: number;
};

export type PasswordUpdateType = {
  oldPassword: string;
  password: string;
  confirmPassword: string;
};
