import React, { createContext, useEffect, useState, useCallback } from "react";
import client from "../api/axios";
import { saveAuth, getAuthToken, getAuthUser, logout as doLogout } from "../utils/authHelpers";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getAuthUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // if token exists but user not loaded, try /auth/me
    const token = getAuthToken();
    if (token && !user) {
      setLoading(true);
      client.get("/auth/me")
        .then(res => {
          setUser(res.data.user);
        })
        .catch(() => {
          // ignore
        })
        .finally(() => setLoading(false));
    }
  }, []);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    const res = await client.post("/auth/login", credentials);
    const { token, user: u } = res.data;
    saveAuth(token, u);
    setUser(u);
    setLoading(false);
    return res;
  }, []);

  const register = useCallback(async (payload) => {
    setLoading(true);
    const res = await client.post("/auth/register", payload);
    const { token, user: u } = res.data;
    saveAuth(token, u);
    setUser(u);
    setLoading(false);
    return res;
  }, []);

  const logout = useCallback(() => {
    doLogout();
    setUser(null);
  }, []);

  const hasRole = useCallback((roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) return roles.includes(user.role);
    return user.role === roles;
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}
