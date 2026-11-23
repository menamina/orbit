import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { UserInfo } from "./tanstack/authTypes";

type AuthContextType = {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  user: UserInfo | null;
  setUser: (user: UserInfo | null) => void;
  // false until we've tried to restore the session from the refresh cookie
  authReady: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const restoring = useRef(false);

  // The access token only lives in memory, so it's gone after every reload.
  // The refresh token is an httpOnly cookie, so ask the server for a fresh
  // access token before deciding the user is logged out.
  useEffect(() => {
    if (restoring.current) return; // StrictMode runs effects twice in dev
    restoring.current = true;

    fetch("http://localhost:5555/api/checkRefreshToken", {
      method: "POST",
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) return;
        const { newAccessToken } = await res.json();
        if (newAccessToken) {
          setAccessToken((current) => current ?? newAccessToken);
        }
      })
      .catch(() => {
        // server unreachable -> treat as logged out
      })
      .finally(() => setAuthReady(true));
  }, []);

  return (
    <AuthContext.Provider
      value={{ accessToken, setAccessToken, user, setUser, authReady }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
