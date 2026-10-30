import Login from "./login";
import Moon from "../imgs/moonrot2.gif";

import { Box } from "@mui/material";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";

function MainPage() {
  const { user } = useAuth();

  const [showText, setShowText] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    if (user) {
      nav("/pill");
    }
  }, [user, nav]);

  return (
    <Box
      sx={{
        backgroundColor: "black",
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: { xs: "column", md: "row" }, // stack mobile, side/side  desktop
      }}
    >
      {showText ? <Login /> : <Login />}
      <Box
        className="moonbox"
        sx={{
          height: { xs: "auto", md: "100%" },
          width: { xs: "100%", md: "100%" },
          paddingBottom: { xs: "20px", md: "30px" },
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <img
          className="moonGIF"
          src={Moon}
          alt="rotating moon gif"
          style={{
            maxWidth: "100%",
            height: "auto",
            objectFit: "contain",
          }}
        />
      </Box>
    </Box>
  );
}

export default MainPage;
