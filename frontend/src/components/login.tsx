import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TextField, Button, Box, Paper } from "@mui/material";
import { useAuth } from "../authContext";
import "../styles/login.css";

import {
  checkIfUsernameIsInUse,
  checkIfEmailIsInUse,
  loginMut,
  signupMut,
} from "../tanstack/authTS";

import type {
  LoginData,
  SignupData,
  LoginResponse,
} from "../tanstack/authTypes";

import GitHubBlack from "../imgs/GitHub_Invertocat_Black_Clearspace.png";

const textFieldCSS = {
  "& .MuiInputBase-input": {
    color: "white",
  },
  "& .MuiInputLabel-root": {
    color: "white",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "white",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "white",
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "white",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "white",
  },
};

function Login() {
  const nav = useNavigate();

  const { user, setAccessToken, setUser } = useAuth();
  const [toggle, setToggle] = useState("login");
  const [searchParams] = useSearchParams();
  const urlError = searchParams.get("error");

  const [loginInfo, setloginInfo] = useState<LoginData>({
    email: "",
    password: "",
  });
  const [signupInfo, setSignupInfo] = useState<SignupData>({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [usernameQuery, setUsernameQuery] = useState<string>("");
  const [emailQuery, setEmailQuery] = useState<string>("");

  const loginComplete = Object.values(loginInfo).every((value) => value !== "");
  const signupComplete = Object.values(signupInfo).every(
    (value) => value !== "",
  );

  // --------- TANSTACK --------- \\

  //  mutations for logging in + signing up \\

  const { mutate: login, error: loginError } = useMutation({
    ...loginMut(),
    onSuccess: (data: LoginResponse) => {
      setAccessToken(data.accessToken);
      setUser(data.userINFO);

      nav("/home");
    },
  });

  const { mutate: signup, error: signupError } = useMutation({
    ...signupMut(),
    onSuccess: () => {
      setToggle("login");
    },
  });

  // debounce useQuery for searching for usernames + emails \\

  const { error: usernameInUse } = useQuery(
    checkIfUsernameIsInUse(usernameQuery),
  );

  const { error: emailInUse } = useQuery(checkIfEmailIsInUse(emailQuery));

  useEffect(() => {
    if (user) {
      nav("/homepage");
    }
  }, [user, nav]);

  useEffect(() => {
    if (signupInfo.username === "") {
      return;
    }

    const timer = setTimeout(() => {
      setUsernameQuery(signupInfo.username);
    }, 300);

    return () => clearTimeout(timer);
  }, [signupInfo.username]);

  useEffect(() => {
    if (signupInfo.email === "") {
      return;
    }

    const timer = setTimeout(() => {
      setEmailQuery(signupInfo.email);
    }, 300);

    return () => clearTimeout(timer);
  }, [signupInfo.email]);

  return (
    <Box className="loginBackground" sx={{ width: "100%", height: "100%" }}>
      <Box>
        {toggle === "login" ? <h1>Login</h1> : <h1>Signup</h1>}
        {toggle === "login" && (
          <Box>
            <Box>
              {urlError && (
                <Paper>
                  {urlError === "oauth_failed"
                    ? "GitHub login failed. Please try again."
                    : null}
                </Paper>
              )}
              {loginError && <Paper>{loginError.message}</Paper>}
              {/* if the login error is email or password highlight the box later */}
            </Box>

            <Button
              variant="outlined"
              onClick={() => {
                window.location.href = "http://localhost:5555/auth/github";
              }}
              sx={{ display: "flex", gap: 1, alignItems: "center" }}
            >
              <img
                src={GitHubBlack}
                alt="github logo"
                style={{ width: 24, height: 24 }}
              />
              <Box>Login with GitHub</Box>
            </Button>

            {(Object.keys(loginInfo) as Array<keyof LoginData>).map((field) => (
              <TextField
                key={field}
                label={field.charAt(0).toUpperCase() + field.slice(1)}
                variant="outlined"
                required
                value={loginInfo[field]}
                onChange={(e) => {
                  setloginInfo((prev) => ({
                    ...prev,
                    [field]: e.target.value,
                  }));
                }}
                sx={textFieldCSS}
              />
            ))}

            {loginComplete && (
              <Button variant="outlined" onClick={() => login(loginInfo)}>
                login
              </Button>
            )}

            {!loginComplete && (
              <Button variant="outlined" disabled>
                login
              </Button>
            )}
          </Box>
        )}
        {toggle === "signup" && (
          <Box>
            {urlError && (
              <Paper>
                {urlError === "oauth_failed"
                  ? "GitHub authentication failed. Please try again."
                  : urlError === "no_token"
                    ? "No token received from GitHub."
                    : "Authentication error. Please try again."}
              </Paper>
            )}

            <Button
              variant="outlined"
              onClick={() => {
                window.location.href = "http://localhost:5555/auth/github";
              }}
              sx={{ display: "flex", gap: 1, alignItems: "center" }}
            >
              <img
                src={GitHubBlack}
                alt="github logo"
                style={{ width: 24, height: 24 }}
              />
              <Box>Continue with GitHub</Box>
            </Button>

            <Box>
              {usernameInUse && <Paper>{usernameInUse.message}</Paper>}
              {emailInUse && <Paper>{emailInUse.message}</Paper>}
              {signupError && <Paper>{signupError.message}</Paper>}
            </Box>

            {(Object.keys(signupInfo) as Array<keyof SignupData>).map(
              (field) => (
                <TextField
                  key={field}
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                  variant="outlined"
                  required
                  value={signupInfo[field]}
                  onChange={(e) => {
                    setSignupInfo((prev) => ({
                      ...prev,
                      [field]: e.target.value,
                    }));
                  }}
                  sx={textFieldCSS}
                />
              ),
            )}

            {signupComplete && (
              <Button variant="outlined" onClick={() => signup(signupInfo)}>
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

        {
          <Box>
            <Box>
              {toggle === "login"
                ? "Don't have an account?"
                : "Already have an account?"}
            </Box>
            <Button
              variant="outlined"
              onClick={() =>
                setToggle((prev) => (prev === "login" ? "signup" : "login"))
              }
            >
              {toggle === "login" ? "Sign Up" : "Log In"}
            </Button>
          </Box>
        }
      </Box>
    </Box>
  );
}

export default Login;
