import { useEffect, useState } from "react";
import { SetupService } from "@/services/SetupService";
import { AuthService } from "@/services/AuthService";
import { useServiceHook } from "@/hooks/useServiceHook";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { LoginScreen } from "@/components/auth/LoginScreen";
import { SetupScreen } from "@/components/auth/SetupScreen";
import App from "@/App.tsx";
import { useAuth } from "@/contexts/AuthContext";

type AuthPhase = "loading" | "app" | "setup" | "login" | "error";

export function AuthInitializer() {
  const { isAuthenticated } = useAuth();
  const [phase, setPhase] = useState<AuthPhase>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { execute: checkSetup } = useServiceHook(() => SetupService.status());
  const { execute: validateMe } = useServiceHook(() => AuthService.me());

  const initializeAuth = async () => {
    setPhase("loading");
    setErrorMessage(null);

    try {
      const status = await checkSetup();

      if (!status.hasUser) {
        setPhase("setup");
        return;
      }

      if (isAuthenticated) {
        try {
          await validateMe();
          setPhase("app");
          return;
        } catch (err: unknown) {
          const axiosError = err as { response?: { status: number } };
          const statusCode = axiosError?.response?.status;

          if (statusCode === 401 || statusCode === 403) {
            throw err;
          }
        }
      }

      setPhase("login");

    } catch (err: unknown) {
      const axiosError = err as { response?: { status: number } };
      const statusCode = axiosError?.response?.status ?? 0;

      const message =
        statusCode >= 500
          ? "Erro no servidor ao verificar configuração."
          : "Falha na conexão. Verifique sua internet ou o backend.";

      setErrorMessage(message);
      setPhase("error");
    }
  };

  useEffect(() => {
    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  if (phase === "loading") {
    return <LoadingScreen message="Verificando configuração..." />;
  }

  if (phase === "error" && errorMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4">
        <div className="text-center space-y-6 max-w-md">
          <p className="text-red-400 text-xl font-medium">{errorMessage}</p>
          <button
            onClick={() => {
              setErrorMessage(null);
              initializeAuth();
            }}
            className="px-8 py-4 bg-teal-600 hover:bg-teal-700 rounded-xl text-white font-medium transition-colors shadow-lg"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (phase === "app") return <App />;
  if (phase === "setup") return <SetupScreen />;
  if (phase === "login") return <LoginScreen />;

  return null;
}