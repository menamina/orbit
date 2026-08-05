export type SignupData = {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type LoginData = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  userINFO: {
    id: number;
    name: string;
    username: string;
    email: string;
  };
};
