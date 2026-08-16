import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Box } from "@mui/material";
import { keyframes } from "@mui/system";

import Open from "../imgs/openArrow.svg";
import Close from "../imgs/closeArrow.svg";

const appNavOptions = ["pill", "cycle", "account", "logout"];

const rolling = keyframes`
  from {
    transform: translateX(-100%);
  }
    to {
    traansform: translateX(100%)
    }

`;

import { logoutMut } from "../tanstack/authTS";

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
        component="nav"
        sx={{
          display: "flex",
          width: "100%",
        }}
      >
        <Box
          onClick={() => setMenuToggle((prev) => !prev)}
          sx={{
            justifySelf: "flex-start",
            width: "30%",
          }}
        >
          <img
            src={menuToggle ? Close : Open}
            alt={menuToggle ? "close nav" : "open nav"}
          />
        </Box>

        {menuToggle && (
          <Box
            sx={{
              animation: `${rolling} 2s ease`,
              display: "flex",
              gap: "20px",
              width: "70%",
            }}
          >
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
