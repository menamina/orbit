import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { TextField, Button, Box, Paper } from "@mui/material";

import { logoutMut } from "../tanstack/authTS";

import Open from "../imgs/openArrow.svg";
import Close from "../imgs/closeArrow.svg";

const appNavOptions = ["pill", "cycle", "account", "logout"];

function Nav() {
  const [menuToggle, setMenuToggle] = useState(false);
  const nav = useNavigate();

  const { mutate: logout } = useMutation({
    ...logoutMut(),
    onSuccess: () => {
      nav("/login");
    },
  });

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
            alt={menuToggle ? "close nav" : "open nav"}
          />
        </Box>

        {menuToggle && (
          <Box component="nav">
            {appNavOptions.map((item) => {
              if (item === "logout") {
                return (
                  <Box key={item} onClick={() => logout()}>
                    {item.toUpperCase()}
                  </Box>
                );
              }

              return (
                <Link key={item} to={`/${item}`}>
                  {item.toUpperCase()}
                </Link>
              );
            })}
          </Box>
        )}
      </Box>
    </>
  );
}

export default Nav;
