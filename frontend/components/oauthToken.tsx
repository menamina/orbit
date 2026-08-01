import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../src/main";

function OAuthToken() {
  const { setAccessToken } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      console.error("OAuth error:", error);
      navigate("/login?error=oauth_failed");
      return;
    }

    if (!token) {
      console.error("No token received from OAuth");
      navigate("/login?error=no_token");
      return;
    }

    // Update access token state FIRST
    setAccessToken(token);

    // Then invalidate auth query to trigger re-authentication check
    queryClient.invalidateQueries({
      queryKey: ["auth", token],
    });

    navigate("/home");
  }, [searchParams, navigate, queryClient, setAccessToken]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: 2,
      }}
    >
      <CircularProgress />
    </Box>
  );
}

export default OAuthToken;
