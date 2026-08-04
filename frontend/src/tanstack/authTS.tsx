import { queryOptions, mutationOptions } from "@tanstack/react-query";
import { SignupData, LoginData } from "./authTypes";

// --------- TANSTACK QUERY + MUTATION OPTIONS --------- \\

// tokens \\

export const authenticateQuery = (accessToken: string) => {
  return queryOptions({
    queryKey: ["auth", accessToken],
    queryFn: () => checkAuth(accessToken),
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

// --------- API CALLS --------- \\

async function checkAuth(
  accessToken: string,
): Promise<{ authenticated: boolean } | { newAccessToken: string }> {
  const res = await fetch(`http://localhost:5555/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
  });

  if (!res.ok) {
    if (res.status === 401) {
      // if 401 - there is no token sent period \\
      throw new Error("Must login");
    } else if (res.status === 403) {
      // if it is 403 the token is expired must check refresh \\
      const refreshRes = await fetch(`http://localhost:5555/api/checkRefreshToken`, {
        method: "post",
        credentials: "include",
      });

      if (!refreshRes.ok) {
        if (refreshRes.status === 401 || refreshRes.status === 403) {
          // 401 or 403 means refresh token is expired or deleted \\
          throw new Error("Must login");
        } else if (refreshRes.status === 500) {
          throw new Error("Oops something went wrong - there's a server error");
        }
      }
      const newToken = await refreshRes.json();
      return newToken;
    }
  }

  const data = await res.json();
  return data; // { authenticated: true }
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

async function login(
  data: LoginData,
): Promise<{
  accessToken: string;
  userINFO: { id: number; name: string; username: string; email: string };
}> {
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
