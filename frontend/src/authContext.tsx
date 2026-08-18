import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { UserInfo } from "./tanstack/authTypes";

type AuthContextType = {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  user: UserInfo | null;
  setUser: (user: UserInfo | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);

  return (
    <AuthContext.Provider
      value={{ accessToken, setAccessToken, user, setUser }}
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
