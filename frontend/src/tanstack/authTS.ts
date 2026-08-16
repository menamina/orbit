import { queryOptions, mutationOptions } from "@tanstack/react-query";
import type {
  SignupData,
  LoginData,
  LoginResponse,
  AuthCheckResponse,
} from "./authTypes";
import { apiFetch, type AuthParams } from "./api";

// --------- TANSTACK QUERY + MUTATION OPTIONS --------- \\

// tokens \\

export const authenticateQuery = (
  accessToken: string,
  onTokenRefresh?: (token: string) => void,
) => {
  return queryOptions({
    queryKey: ["auth", accessToken],
    queryFn: () => checkAuth(accessToken, onTokenRefresh),
    enabled: !!accessToken,
  });
};

// checking if username +/ email taken when signing up \\

export const checkIfUsernameIsInUse = (username: string) => {
  return queryOptions({
    queryKey: ["isUsernameTaken", username],
    queryFn: () => isUsernameTaken(username),
    enabled: !!username && username.length > 3,
  });
};

export const checkIfEmailIsInUse = (email: string) => {
  return queryOptions({
    queryKey: ["isEmailTaken", email],
    queryFn: () => isEmailTaken(email),
    enabled: !!email,
  });
};

// logging in + signing up muts \\

export const signupMut = () => {
  return mutationOptions({
    mutationFn: signup,
  });
};

export const loginMut = () => {
  return mutationOptions({
    mutationFn: login,
  });
};

export const logoutMut = () => {
  return mutationOptions({
    mutationFn: logout,
  });
};

export const logoutEverywhereMut = () => {
  return mutationOptions({
    mutationFn: logoutEverywhere,
  });
};

// --------- API CALLS --------- \\

async function checkAuth(
  accessToken: string,
  onTokenRefresh?: (token: string) => void,
): Promise<AuthCheckResponse> {
  const res = await apiFetch(`http://localhost:5555/`, {
    accessToken,
    onTokenRefresh,
  });

  if (!res.ok) {
    throw new Error("Must login");
  }

  const data = await res.json();
  return data; // { authenticated: true, user: { id, name, username, email } }
}

async function isUsernameTaken(
  username: string,
): Promise<{ success: boolean }> {
  const res = await fetch(
    `http://localhost:5555/api/signup/username?username=${username}`,
  );
  const data = await res.json();

  if (!res.ok) {
    if (res.status === 500) {
      throw new Error("Oops something went wrong - there's a server error");
    } else {
      throw data;
    }
  }

  return data;
}

async function isEmailTaken(email: string): Promise<{ success: boolean }> {
  const res = await fetch(
    `http://localhost:5555/api/signup/email?email=${email}`,
  );
  const data = await res.json();

  if (!res.ok) {
    if (res.status === 500) {
      throw new Error("Oops something went wrong - there's a server error");
    } else {
      throw data;
    }
  }

  return data;
}

async function signup(data: SignupData): Promise<{ success: boolean }> {
  const res = await fetch(`http://localhost:5555/api/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const responseData = await res.json();

  if (!res.ok) {
    if (res.status === 500) {
      throw new Error("Oops something went wrong - there's a server error");
    } else {
      throw responseData;
    }
  }

  return responseData;
}

async function login(data: LoginData): Promise<LoginResponse> {
  const res = await fetch(`http://localhost:5555/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const responseData = await res.json();

  if (!res.ok) {
    if (res.status === 500) {
      throw new Error("Oops something went wrong - there's a server error");
    } else {
      throw responseData;
    }
  }

  return responseData;
}

async function logout(): Promise<{ success: boolean }> {
  const res = await fetch(`http://localhost:5555/api/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    if (res.status === 500) {
      throw new Error("Oops something went wrong - there's a server error");
    }
  }

  return await res.json();
}

async function logoutEverywhere({
  accessToken,
  onTokenRefresh,
}: AuthParams): Promise<{ success: boolean }> {
  const res = await apiFetch(`http://localhost:5555/api/logoutEverywhere`, {
    method: "POST",
    accessToken,
    onTokenRefresh,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(
      errorData.error || "Oops something went wrong - there's a server error",
    );
  }

  return await res.json();
}
