/* eslint-disable react-hooks/refs */

import "./login_signup.css";
import { login_signup_Schema } from "../Utils/Login_SignUp_ValidationSchema";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { signin } from "../Services/ApiService";
import axios from "axios";
import type { SnackbarHandle } from "../GlobalSnackbar";
import GlobalSnackbar from "../GlobalSnackbar";
import Spinner from "../Spinner";

interface LoginProps {
  onLogin: (username: string) => void;
  onSwitchToSignUp: () => void;
}

type LoginFormValues = z.infer<typeof login_signup_Schema>;

const Login = ({ onLogin, onSwitchToSignUp }: LoginProps) => {
  const snackbarRef = useRef<SnackbarHandle>(null);
  const [loading,setLoading] = useState<boolean> (false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(login_signup_Schema),
    mode: "onTouched",
  });

  const [rememberMe, setRememberMe] = useState<boolean>(
    Cookies.get("rememberMe") === "true" || false,
  );

  const localSignIn = async (data: LoginFormValues) => {
    setLoading(true)
    try {
      const response = await signin({
        username: data.username,
        password: data.password,
      });
      snackbarRef.current?.showNotification(`${response.message}`, "success");
      sessionStorage.setItem("token", response?.data?.token);
      sessionStorage.setItem("username", response?.data?.username);
      setTimeout(() => onLogin(response?.data?.username), 1000);
      setLoading(false)
    } catch (error) {
      setLoading(false)
      if (axios.isAxiosError(error)) {
        snackbarRef.current?.showNotification(
          `Login Failed - ${error.response?.data?.message}`,
          "error",
        );
      } else {
        snackbarRef.current?.showNotification(
          "Login Failed - Something went wrong",
          "error",
        );
      }
    }
  };

  const onSubmit = (data: LoginFormValues) => {
    if (rememberMe) {
      Cookies.set("username", data.username, { expires: 7 });
      Cookies.set("password", data.password, { expires: 7 });
      Cookies.set("rememberMe", "true", { expires: 7 });
    } else {
      Cookies.remove("username");
      Cookies.remove("password");
      Cookies.remove("rememberMe");
    }

    localSignIn(data);
  };

  useEffect(() => {
    const remember = Cookies.get("rememberMe") === "true";

    if (remember) {
      setValue("username", Cookies.get("username") || "");
      setValue("password", Cookies.get("password") || "");
    }
  }, [setValue]);

  return (
    <div className="auth-card">
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h2>Enjoy Your Game Time</h2>
        <p style={{ color: "var(--text-secondary)" }}>
          Log in to your player account
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="input-group">
          <label>Username</label>
          <input
            {...register("username")}
            className={`input-field ${errors.username ? "error" : ""}`}
            placeholder="Enter username"
            type="text"
          />
          {errors.username && (
            <p className="error-message">{errors.username.message}</p>
          )}
        </div>
        <div className="input-group">
          <label>Password</label>
          <input
            {...register("password")}
            className={`input-field ${errors.password ? "error" : ""}`}
            type="password"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="error-message">{errors.password.message}</p>
          )}
        </div>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Signing In..." : "Sign In"}
        </button>
      </form>
      <div className="rememberMe-div">
        <input
          type="checkbox"
          className="rememberMe-checkbox"
          checked={rememberMe}
          onChange={() => {
            setRememberMe(!rememberMe);
          }}
        />
        <div>Remember Me</div>
      </div>
      <p
        style={{
          textAlign: "center",
          marginTop: "1.5rem",
          fontSize: "0.875rem",
        }}
      >
        New player ?{" "}
        <span
          onClick={onSwitchToSignUp}
          style={{
            color: "var(--primary-accent)",
            cursor: "pointer",
            fontWeight: "bold",
            marginLeft: "10px",
          }}
        >
          Create Account
        </span>
      </p>
      <GlobalSnackbar ref={snackbarRef} />
      {loading && <Spinner />}
    </div>
  );
};

export default Login;
