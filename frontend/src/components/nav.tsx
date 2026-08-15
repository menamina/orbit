import { useState, useEffect } from "react";
import { TextField, Button, Box, Paper, List, ListItem } from "@mui/material";

import Open from "../imgs/openArrow.svg";
import Close from "../imgs/closeArrow.svg";

const appNavOptions = ["PILL", "CYCLE", "ACCOUNT", "LOGOUT"];

function Nav() {
  const [menuToggle, setMenuToggle] = useState(false);

  return (
    <>
      <Box
        sx={{
          display: "flex",
        }}
      >
        <Box onClick={() => setMenuToggle((prev) => !prev)}>
          <img
            src={menuToggle ? Close : Open}
            alt={menuToggle ? "close menu" : "open menu"}
          />
        </Box>

        {menuToggle && (
          <Box>
            <List>{appNavOptions.map((item) => {})}</List>
          </Box>
        )}
      </Box>
    </>
  );
}

export default Nav;
