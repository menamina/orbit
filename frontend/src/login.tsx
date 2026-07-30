import { useState } from "react";
import { useNavigation } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";

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
  const [toggle, setToggle] = useState<boolean>(false);
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
}

export default Login;
