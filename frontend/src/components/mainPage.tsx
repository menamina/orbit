import Login from "./login";
import Moon from "../imgs/moonrot2.gif";

import { Button, Box, Paper } from "@mui/material";

import { useState, useEffect } from "react";

function MainPage() {
  const [showText, setShowText] = useState(true);

  return (
    <Box>
      <Login />
      <Box>
        <img src={Moon} alt="rotating moon gif" />
      </Box>
    </Box>
  );
}

export default MainPage;
