import { useNavigate, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { authenticateQuery } from "./tanstack/authTS";
import { useAuth } from "./authContext";

function Index() {
  const { accessToken, setAccessToken, setUser } = useAuth();
  const nav = useNavigate();

  const { data, isSuccess, isError } = useQuery(
    authenticateQuery(accessToken || "", setAccessToken),
  );

  useEffect(() => {
    if (!accessToken) {
      nav("/login");
      return;
    }

    // If authentication succeeded
    if (isSuccess && data) {
      if (
        typeof data === "object" &&
        data !== null &&
        "authenticated" in data &&
        data.authenticated
      ) {
        setUser(data.user);
        nav("/homepage");
      }
    }

    if (isError) {
      setAccessToken(null);
      setUser(null);
      nav("/login");
    }
  }, [accessToken, isSuccess, isError, data, setUser, setAccessToken, nav]);

  return <Outlet />;
}

export default Index;
