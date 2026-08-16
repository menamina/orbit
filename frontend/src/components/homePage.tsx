import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Box } from "@mui/material";

import { useAuth } from "./authContext";

function Home() {
  const { accessToken, setAccessToken, setUser } = useAuth();
  const nav = useNavigate();

  return <Box></Box>;
}

export default Home;
