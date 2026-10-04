import React, { createContext, useCallback, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [status, setStatus] = useState("authenticated");

  const refresh = useCallback(async () => {
    setStatus("authenticated");
  }, []);

  const login = useCallback(async () => {
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    setStatus("authenticated");
  }, []);

  return (
    <AuthContext.Provider value={{ status, refresh, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider.");
  return context;
}

