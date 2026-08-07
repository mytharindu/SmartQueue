import { createContext, useContext, useEffect, useState } from "react";
import {
  getCurrentUser,
  loginAccount,
  registerAccount,
  logoutAccount,
} from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setIsLoading(false);
      return;
    }
    getCurrentUser()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("authToken");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email, password) => {
    const { token, user: loggedInUser } = await loginAccount(email, password);
    localStorage.setItem("authToken", token);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = (payload) => registerAccount(payload);

  const logout = async () => {
    try {
      await logoutAccount();
    } catch {
      // token may already be invalid; still clear local state
    }
    localStorage.removeItem("authToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
