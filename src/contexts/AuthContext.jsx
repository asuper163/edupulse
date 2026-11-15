import {createContext, useContext, useMemo, useState, useCallback} from "react";
import {authService} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({children}) {
  const [user, setUser] = useState(() => authService.getCurrentUser());

  const login = useCallback((email, password) => {
    const res = authService.login(email, password);
    if (res.ok) setUser(res.user);
    return res;
  }, []);

  const register = useCallback((data) => {
    const res = authService.register(data);
    if (res.ok) setUser(res.user);
    return res;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback((patch) => {
    setUser((current) => {
      if (!current) return current;
      const updated = authService.updateProfile(current.id, patch);
      return updated || current;
    });
  }, []);

  const refresh = useCallback(() => setUser(authService.getCurrentUser()), []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      role: user?.role || null,
      login,
      register,
      logout,
      updateProfile,
      refresh,
    }),
    [user, login, register, logout, updateProfile, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
