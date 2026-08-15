/**
 * Enhanced fetch wrapper that handles token refresh automatically
 */

interface FetchOptions extends RequestInit {
  accessToken?: string;
}

export async function apiFetch(
  url: string,
  options: FetchOptions = {},
): Promise<Response> {
  const { accessToken, ...fetchOptions } = options;

  // Add authorization header if access token provided
  const headers = new Headers(fetchOptions.headers);
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  // Make the initial request
  const res = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: "include",
  });

  // If access token expired, try to refresh
  if (res.status === 403) {
    const errorData = await res.json();

    if (errorData.accessTokenExpired) {
      // Try to refresh the token
      const refreshRes = await fetch(
        "http://localhost:5555/api/checkRefreshToken",
        {
          method: "POST",
          credentials: "include",
        },
      );

      if (!refreshRes.ok) {
        throw new Error("Session expired - please login again");
      }

      const { newAccessToken } = await refreshRes.json();

      // Retry the original request with new token
      headers.set("Authorization", `Bearer ${newAccessToken}`);
      const retryRes = await fetch(url, {
        ...fetchOptions,
        headers,
        credentials: "include",
      });

      // Return the retry response along with the new token
      // Store the new token for future requests
      if (retryRes.ok) {
        localStorage.setItem("accessToken", newAccessToken);
      }

      return retryRes;
    }
  }

  return res;
}
