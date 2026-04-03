import { useState, useEffect, type ReactNode } from "react";
import { SessionService } from "@/services/SessionService";
import { AuthContext } from "@/contexts/AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(SessionService.isAuthenticated());

  const refreshAuth = () => {
    setIsAuthenticated(SessionService.isAuthenticated());
  };

  const logout = () => {
    SessionService.clearToken();
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "access_token") {
        refreshAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, refreshAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}