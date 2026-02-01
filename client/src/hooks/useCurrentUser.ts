import { useMemo } from "react";
import { jwtDecode } from "jwt-decode";
import { SessionService } from "@/services/SessionService";

interface JwtPayload {
  sub?: string;
  name?: string;
  username?: string;
  displayName?: string;
  [key: string]: unknown;
}

export function useCurrentUser() {
  const token = SessionService.getToken();

  return useMemo(() => {
    if (!token) return null;

    try {
      const decoded = jwtDecode<JwtPayload>(token);

      const displayName =
        decoded.displayName ||
        decoded.name ||
        decoded.username ||
        decoded.sub ||
        "Usuário";

      return {
        displayName,
        username: decoded.username || decoded.sub || null,
      };
    } catch (err) {
      console.warn("Falha ao decodificar token JWT:", err);
      return null;
    }
  }, [token]);
}