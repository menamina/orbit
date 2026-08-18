import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";

import Nav from "../nav";

function Home() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Nav />
      <Outlet />
    </Box>
  );
}

export default Home;
