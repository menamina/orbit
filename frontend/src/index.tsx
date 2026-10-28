import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { authenticateQuery } from "./tanstack/authTS";
import { useAuth } from "./authContext";
import "./styles/global.css";

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
      nav("/homepage");
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

  return (
    <div className="mainDiv">
      <Outlet />
    </div>
  );
}

export default Index;
