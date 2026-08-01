import { useState } from "react";
import { useNavigation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { authenticateQuery } from "./tanstack/authTS";

function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const nav = useNavigation();

  const { error: authError } = useQuery({
    ...authenticateQuery(accessToken),
    onSuccess: (data: { accessToken?: string }) => {
      if (data?.accessToken) {
        // If we got a new access token from refresh, update it
        setAccessToken(data.accessToken);
      }
    },
    onError: () => {
      // Clear token on auth error
      setAccessToken(null);
      nav("/login");
    },
  });
}

export default App;
