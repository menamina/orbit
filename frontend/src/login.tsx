import { useState } from "react";
import { useNavigation } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TextField, Button } from "@mui/material";

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

  const loginComplete = Object.values(loginInfo).every(
    (value) => value !== "",
  );
  const signupComplete = Object.values(signupInfo).every(
    (value) => value !== "",
  );

  return (
    <>
      {toggle === "login" && (
        <div>
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
        </div>
      )}
      {toggle === "signup" && (
        <div>
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
              login
            </Button>
          )}

          {!signupComplete && (
            <Button variant="outlined" disabled>
              login
            </Button>
          )}
        </div>
        </div>
      )}
    </>
  );
}

export default Login;
