/* eslint-disable react-hooks/refs */

import "./login_signup.css";
import { login_signup_Schema } from "../Utils/Login_SignUp_ValidationSchema";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signup } from "../Services/ApiService";
import axios from "axios";
import type { SnackbarHandle } from "../GlobalSnackbar";
import { useRef, useState } from "react";
import GlobalSnackbar from "../GlobalSnackbar";
import Spinner from "../Spinner";

interface SignUpProps {
  onSwitchToLogin: () => void;
}

type SignUpFormValues = z.infer<typeof login_signup_Schema>;

const SignUp = ({ onSwitchToLogin }: SignUpProps) => {
  const snackbarRef = useRef<SnackbarHandle>(null);
  const [loading,setLoading] = useState<boolean> (false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(login_signup_Schema),
    mode: "onTouched",
  });

  const localSignUp = async (data: SignUpFormValues) => {
    setLoading(true)
    try {
      const response = await signup({
        username: data.username,
        password: data.password,
      });
      snackbarRef.current?.showNotification(`${response.message}`, "success");
      setTimeout(() => onSwitchToLogin(), 1000);
      setLoading(false)
    } catch (error) {
      setLoading(false)
      if (axios.isAxiosError(error)) {
        snackbarRef.current?.showNotification(
          `Registration Failed - ${error.response?.data?.message}`,
          "error",
        );
      } else {
        snackbarRef.current?.showNotification(
          "Registration Failed - Something went wrong",
          "error",
        );
      }
    }
  };

  const onSubmit = (data: SignUpFormValues) => {
    localSignUp(data);
  };

  return (
    <div className="auth-card">
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h2>Join the Arena</h2>
        <p style={{ color: "var(--text-secondary)" }}>
          Create your gaming identity
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="input-group">
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
          {isSubmitting ? "Registering..." : "Register"}
        </button>
      </form>
      <p
        style={{
          textAlign: "center",
          marginTop: "1.5rem",
          fontSize: "0.875rem",
        }}
      >
        Already have an account ?{" "}
        <span
          onClick={onSwitchToLogin}
          style={{
            color: "var(--primary-accent)",
            cursor: "pointer",
            fontWeight: "bold",
            marginLeft: "10px",
          }}
        >
          Login
        </span>
      </p>
      <GlobalSnackbar ref={snackbarRef} />
      {loading && <Spinner />}
    </div>
  );
};

export default SignUp;
