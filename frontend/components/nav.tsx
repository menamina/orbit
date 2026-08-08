import { useState, useEffect } from "react";
import { TextField, Button, Box, Paper } from "@mui/material";

const appNavOptions = {
  birthcontrol: [],
  cycle: [],
  settings: [],
  logout: [],
};

function Nav() {
  const [menuToggle, setMenuToggle] = useState(false);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box onClick={() => menuToggle()}>
          <img src="" alt="" />
        </Box>
        <Box>{menuToggle && <Box></Box>}</Box>
      </Box>
    </>
  );
}

export default Nav;
