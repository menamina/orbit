import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

import Open from "../imgs/openArrow.svg";
import Close from "../imgs/closeArrow.svg";

const appNavOptions = ["pill", "cycle", "account", "logout"];

function Nav() {
  const [menuToggle, setMenuToggle] = useState(false);
  const nav = useNavigate();

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
            <List>
              {appNavOptions.map((item) => (
                <ListItem
                  key={item}
                  onClick={() => (item === "logout" ? null : nav(`/${item}`))}
                >
                  <ListItemText primary={item.toUpperCase()} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Box>
    </>
  );
}

export default Nav;
