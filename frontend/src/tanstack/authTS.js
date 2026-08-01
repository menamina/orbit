import { queryOptions, mutationOptions } from "@tanstack/react-query";

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
    queryFN: () => isUsernameTaken(username),
    enabled: !!username,
  })

}

export const checkIfEmailIsInUse = (email: string) => {
  return queryOptions({
    queryKey: ["isUsernameTaken", email],
    queryFN: () => isEmailTaken(email),
    enabled: !!email,
  })

}

// logging in + signing up muts \\

export const loginMut = () => {
  return mutationOptions({
    mutationFn: login,
  })
}

export const signupMut = () => {
  return mutationOptions({
    mutationFn: signup,
  })
}



// --------- API CALLS --------- \\

async function checkAuth(accessToken: string) {
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
      const res = await fetch(`http://localhost:5555/api/checkRefreshToken`, {
        method: "post",
        credentials: "include",
      });

      if (!res.ok) {
        const error = new Error();

        if (res.status === 401 || res.status === 403) {
          // 401 or 403 means refresh token is expired or deleted \\
          error.noRefreshToken = "Must login";
        } else if (res.status === 500) {
          error.serverError = "A server error occured. Please try again";
        }
        throw error;
      }
      const accessToken = await res.json();
      return accessToken;
    }
  }

  const data = await res.json();
  return data; // { authenticated: true }
}


