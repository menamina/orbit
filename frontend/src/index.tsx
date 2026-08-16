import { useNavigate } from "react-router-dom";
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
    if (isSuccess && data) {
      if (
        typeof data === "object" &&
        data !== null &&
        "authenticated" in data &&
        data.authenticated
      ) {
        setUser(data.user);
      }
      nav("/home");
    }

    if (isError) {
      setAccessToken(null);
      setUser(null);
      nav("/login");
    }
  }, [isSuccess, isError, data, setUser, setAccessToken, nav]);

  return null;
}

export default Index;
