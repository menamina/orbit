import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Box } from "@mui/material";
import { keyframes } from "@mui/system";

import Open from "../../imgs/openArrow.svg";
import Close from "../../imgs/closeArrow.svg";
import { logoutMut } from "../../tanstack/authTS";
import { useAuth } from "../../authContext";
import "../../styles/nav.css";

const appNavOptions = ["pill", "cycle", "account", "logout"];

const slideIn = keyframes`
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-100%);
    opacity: 0

  }
`;

function Nav() {
  const [menuToggle, setMenuToggle] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const nav = useNavigate();
  const { setAccessToken, setUser } = useAuth();

  const { mutate: logout } = useMutation({
    ...logoutMut(),
    onSuccess: () => {
      setAccessToken(null);
      setUser(null);
      nav("/login");
    },
  });

  const handleToggle = () => {
    if (menuToggle) {
      // Start exit animation
      setIsAnimating(true);
      setTimeout(() => {
        setMenuToggle(false);
        setIsAnimating(false);
      }, 2000); // Match animation duration (2s)
    } else {
      setMenuToggle(true);
    }
  };

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
          onClick={handleToggle}
          sx={{
            justifySelf: "flex-start",
            width: "50%",
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
              animation: `${isAnimating ? slideOut : slideIn} 2s ease`,
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
