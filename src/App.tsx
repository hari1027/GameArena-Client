import { useState, useEffect } from "react";
import "./App.css";
import Login from "./MainComponents/Login";
import Dashboard from "./MainComponents/Dashboard";
import SignUp from "./MainComponents/SignUp";
import { makeUserActive, makeUserInactive } from "./Services/ApiService";

function App() {
  const [user, setUser] = useState<string | null>(null);
  const [view, setView] = useState<string>("login");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDarkMode ? "dark" : "light",
    );
  }, [isDarkMode]);

  useEffect(() => {
    const initializeFunction = async () => {
      if (
        sessionStorage.getItem("username") &&
        sessionStorage.getItem("username") !== null
      ) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(sessionStorage.getItem("username"));
        await makeUserActive({ username: sessionStorage.getItem("username") });
      }
    };

    initializeFunction();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = async () => {
      const username = sessionStorage.getItem("username");
      if (username && username !== null) {
        await makeUserInactive({ username: username });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  if (user) {
    return (
      <Dashboard
        user={user}
        isDarkMode={isDarkMode}
        toggleTheme={() => setIsDarkMode(!isDarkMode)}
        onLogout={() => {
          setUser(null);
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("username");
          sessionStorage.removeItem("roomId");
          sessionStorage.removeItem("gameType");
          sessionStorage.removeItem("gameStarted");
          sessionStorage.removeItem("timeleft")
        }}
      />
    );
  }

  return (
    <div className="auth-wrapper">
      {view === "login" ? (
        <Login
          onLogin={(username: string) => {
            setUser(username);
          }}
          onSwitchToSignUp={() => setView("signup")}
        />
      ) : (
        <SignUp onSwitchToLogin={() => setView("login")} />
      )}
    </div>
  );
}

export default App;
