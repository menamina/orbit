import { Outlet, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { authenticateQuery } from "./tanstack/authTS";
import { useAuth } from "./authContext";

function Index() {
  const { accessToken, setAccessToken, setUser } = useAuth();
  const nav = useNavigate();

  useQuery({
    ...authenticateQuery(accessToken || ""),
    onSuccess: (data: any) => {
      // Server returned a new access token (from refresh token)
      if (typeof data === "object" && data !== null && "newAccessToken" in data) {
        const newToken = data.newAccessToken;
        setAccessToken(newToken);
      }

      // Server returned authentication with user info
      if (typeof data === "object" && data !== null && "authenticated" in data && data.authenticated) {
        setUser(data.user);
      }

      nav("/home");
    },
    onError: () => {
      setAccessToken(null);
      setUser(null);
      nav("/login");
    },
  });

  return <Outlet />;
}

export default Index;
