import { useState } from "react";
import { toast } from "sonner";
import { AuthService } from "@/services/AuthService";
import { useServiceHook } from "@/hooks/useServiceHook";
import type { LoginRequest } from "@/interfaces/requests/LoginRequest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaLayerGroup } from "react-icons/fa";
import { SessionService } from "@/services/SessionService";
import { useAuth } from "@/contexts/AuthContext";

export function LoginScreen() {
  const [form, setForm] = useState<LoginRequest>({
    username: "",
    password: "",
  });

  const { execute: login, loading } = useServiceHook((data: LoginRequest) =>
    AuthService.login(data)
  );

  const { refreshAuth } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.username.trim() || !form.password.trim()) {
      toast.error("Preencha usuário e senha.");
      return;
    }

    const response = await login(form);
    SessionService.setToken(response.accessToken);
    refreshAuth();
    toast.success("Login realizado com sucesso.");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800/70 backdrop-blur-sm border border-slate-700 rounded-xl shadow-2xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-4 rounded-xl mb-4">
            <FaLayerGroup className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Terraform Explorer</h1>
          <p className="text-slate-400 mt-1">Faça login para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-slate-200">
              Usuário
            </Label>
            <Input
              id="username"
              placeholder="usuario.admin"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-violet-500"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-200">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-violet-500"
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-6 transition-colors"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-8">
          Sistema de gerenciamento de estrutura Terraform
        </p>
      </div>
    </div>
  );
}