import { useState, useEffect } from "react";
import { useNavigation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TextField, Button, Box, Paper } from "@mui/material";

import {
  checkIfUsernameIsInUser,
  checkIfEmailIsInUse,
  loginMut,
  signupMut,
} from "./tanstack/authTS";

interface LoginInfo {
  email: string;
  password: string;
}

interface SignupInfo {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

function Login() {
  const [toggle, setToggle] = useState("login");

  const [loginInfo, setloginInfo] = useState<LoginInfo>({
    email: "",
    password: "",
  });
  const [signupInfo, setSignupInfo] = useState<SignupInfo>({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [usernameQuery, setUsernameQuery] = useState("");
  const [emailQuery, setEmailQuery] = useState("");

  const loginComplete = Object.values(loginInfo).every((value) => value !== "");
  const signupComplete = Object.values(signupInfo).every(
    (value) => value !== "",
  );

  const nav = useNavigation();
  const queryClient = useQueryClient();

  // --------- TANSTACK --------- \\

  //  mutations for logging in + signing up \\

  const { data: login, error: loginError } = useMutation({
    ...loginMut(loginInfo),
    onSuccess: () => {
      queries;
    },
  });

  const { data: signup, error: signupError } = useMutation({
    ...signupMut(signupInfo),
    onSuccess: () => {
      setToggle("login");
    },
  });

  // debounce useQuery for searching for usernames + emails \\

  const { error: usernameInUse } = useQuery(
    checkIfUsernameIsInUser(usernameQuery),
  );

  const { error: emailInUse } = useQuery(checkIfEmailIsInUse(emailQuery));

  useEffect(() => {
    if (signupInfo.username === "") {
      setUsernameQuery("");
      return;
    }

    const timer = setTimeout(() => {
      setUsernameQuery(signupInfo.username);
    }, 300);

    return () => clearTimeout(timer);
  }, [signupInfo.username]);

  useEffect(() => {
    if (signupInfo.email === "") {
      setEmailQuery("");
      return;
    }

    const timer = setTimeout(() => {
      setEmailQuery(signupInfo.email);
    }, 300);

    return () => clearTimeout(timer);
  }, [signupInfo.email]);

  return (
    <>
      {toggle === "login" && (
        <Box>
          <Box>{loginError && <Paper>{loginError.message}</Paper>}</Box>

          {(Object.keys(loginInfo) as Array<keyof LoginInfo>).map((field) => (
            <TextField
              key={field}
              label={field.charAt(0).toUpperCase()}
              variant="outlined"
              required
              value={loginInfo[field]}
              onChange={(e) => {
                setloginInfo((prev) => ({ ...prev, [field]: e.target.value }));
              }}
            />
          ))}

          {loginComplete && (
            <Button variant="outlined" onClick={login}>
              login
            </Button>
          )}

          {!loginComplete && (
            <Button variant="outlined" disabled>
              login
            </Button>
          )}

          {/* oauth login */}
        </Box>
      )}
      {toggle === "signup" && (
        <Box>
          <Box>
            <Paper>Already have an account?</Paper>
            <Button variant="outlined" onClick={() => setToggle("login")}>
              login here
            </Button>
          </Box>

          <Box>
            {usernameInUse && <Paper>{loginError.message}</Paper>}
            {emailInUse && <Paper>{emailError.message}</Paper>}
            {signupError.map((error) => {
              <Paper>{error}</Paper>;
            })}
          </Box>

          {(Object.keys(signupInfo) as Array<keyof SignupInfo>).map((field) => (
            <TextField
              key={field}
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              variant="outlined"
              required
              value={signupInfo[field]}
              onChange={(e) => {
                setSignupInfo((prev) => ({ ...prev, [field]: e.target.value }));
              }}
            />
          ))}

          {signupComplete && (
            <Button variant="outlined" onClick={signup}>
              signup
            </Button>
          )}

          {!signupComplete ||
            ((usernameInUse || emailInUse) && (
              <Button variant="outlined" disabled>
                signup
              </Button>
            ))}

          {/* oauth login */}
        </Box>
      )}
    </>
  );
}

export default Login;
