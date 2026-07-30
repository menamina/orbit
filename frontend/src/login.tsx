import { useState } from "react";
import { useNavigation } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TextField } from "@mui/material";

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

  return (
    <>
      {toggle === "login" && <div></div>}
      {toggle === "signup" && <div></div>}
    </>
  );
}

export default Login;
