import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { authenticateQuery } from "./tanstack/authTS";
import { useAuth } from "./authContext";
import "./styles/global.css";

import { Box } from "@mui/material";

import Nav from "./components/app/nav";

function Index() {
  const { accessToken, setAccessToken, setUser } = useAuth();
  const nav = useNavigate();
  const location = useLocation();

  const { data, isSuccess, isError, isLoading } = useQuery(
    authenticateQuery(accessToken || "", setAccessToken),
  );

  const isOnPublicRoute =
    location.pathname === "/login" || location.pathname === "/auth/callback";

  useEffect(() => {
    if (isOnPublicRoute) return;

    if (!accessToken || isError) {
      setAccessToken(null);
      setUser(null);
      nav("/login");
      return;
    }

    if (isSuccess && data && "authenticated" in data && data.authenticated) {
      setUser(data.user);
    }
  }, [
    accessToken,
    isSuccess,
    isError,
    data,
    setUser,
    setAccessToken,
    nav,
    isOnPublicRoute,
  ]);

  if (!isOnPublicRoute && isLoading) {
    return null;
  }

  // Don't render protected routes if not authenticated
  if (!isOnPublicRoute && !accessToken) {
    return null;
  }

  return (
    <Box
      className="mainDiv"
      sx={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      {!isOnPublicRoute && <Nav />}
      <Outlet />
    </Box>
  );
}

export default Index;
