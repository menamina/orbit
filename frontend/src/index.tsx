import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { authenticateQuery } from "./tanstack/authTS";

function Index() {
  const { accessToken, setAccessToken } = useState<string>("");
  const nav = useNavigate();

  useQuery({
    ...authenticateQuery(accessToken),
    onSuccess: (data: any) => {
      // Server returned a new access token (from refresh token)
      if (typeof data === "object" && data !== null && "accessToken" in data) {
        const newToken = data.accessToken;
        setAccessToken(newToken);
      }

      nav("/home");
    },
    onError: () => {
      setAccessToken(null);
      nav("/login");
    },
  });

  return <Outlet context={{ accessToken, setAccessToken }} />;
}

export default Index;
