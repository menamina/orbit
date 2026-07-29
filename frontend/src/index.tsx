import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessToken, setAccessToken] = useState();

  const { data: tokenData, error: tokenError } = useQuery(authenticate());
}

export default App;
