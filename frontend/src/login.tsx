import { useState, useEffect } from "react";
import { useNavigation } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TextField, Button } from "@mui/material";

import {
  checkIfUsernameIsInUser,
  checkIfEmailIsInUse,
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

  // --------- TANSTACK --------- \\

  //  mutations for logging in + signing up \\

  const { data: loginMutation, error: loginError } = useMutation({});

  const { data: signupMutation, error: signupError } = useMutation({});

  // debounce useQuery for searching for usernames + emails \\

  const { data: userNameSignupQuery, error: usernameInUse } = useQuery(
    checkIfUsernameIsInUser(usernameQuery),
  );

  const { data: emailSignupQuery, error: emailInUse } = useQuery(
    checkIfEmailIsInUse(emailQuery),
  );

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
        <div>
          {/* any manual login errors above here */}

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
            <Button variant="outlined" onClick={loginMutation}>
              login
            </Button>
          )}

          {!loginComplete && (
            <Button variant="outlined" disabled>
              login
            </Button>
          )}

          {/* oauth login */}
        </div>
      )}
      {toggle === "signup" && (
        <div>
          {/* any signup errors above here */}

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
            <Button variant="outlined" onClick={signupMutation}>
              signup
            </Button>
          )}

          {!signupComplete && (
            <Button variant="outlined" disabled>
              signup
            </Button>
          )}

          {/* oauth login */}
        </div>
      )}
    </>
  );
}

export default Login;
