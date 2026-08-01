import { useState } from "react";
import { useNavigation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { authenticateQuery } from "./tanstack/authTS";

function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const nav = useNavigation();

  useQuery({
    ...authenticateQuery(accessToken),
    onSuccess: (data) => {
      // Server returned a new access token (from refresh token)
      if (typeof data === "object" && data !== null && "accessToken" in data) {
        const newToken = data.accessToken;
        setAccessToken(newToken);
      }
      // If data is "Access token accepted" string, do nothing - token is still valid
    },
    onError: (error: Error) => {
      console.log(error);
      setAccessToken(null);
      nav("/login");
    },
  });
}

export default App;
