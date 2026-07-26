import { createContext, useContext, useEffect, useState } from "react";
import api from "@/api";

const AuthContext = createContext(undefined);

const useAuth = () => {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error("useAuth must be used within an authProvider");
  }
  return authContext;
};

const AuthProvider = ({ children }) => {
  const [toke, setToken] = useState();

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await api.get("/api/me");
        setToken(res.data.accessToken);
      } catch {
        setToken(null);
      }
    }

    fetchMe();
  }, []);
};
