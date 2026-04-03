import { useState } from "react";
import { toast } from "sonner";
import { SetupService } from "@/services/SetupService";
import { useServiceHook } from "@/hooks/useServiceHook";
import type { RegisterRequest } from "@/interfaces/requests/RegisterRequest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaLayerGroup } from "react-icons/fa";
import { AuthService } from "@/services/AuthService";
import { SessionService } from "@/services/SessionService";
import { useAuth } from "@/contexts/AuthContext";

export function SetupScreen() {
  const [form, setForm] = useState<RegisterRequest>({
    displayName: "",
    username: "",
    password: "",
  });

  const { execute: setup, loading } = useServiceHook((data: RegisterRequest) =>
    SetupService.setup(data)
  );

  const { refreshAuth } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.displayName.trim() || !form.username.trim() || !form.password.trim()) {
      toast.error("Preencha todos os campos.");
      return;
    }

    if (form.password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    await setup(form);
    toast.success("Usuário criado! Entrando automaticamente...");

    const autoLoginResponse = await AuthService.login({
      username: form.username,
      password: form.password,
    });
    
    SessionService.setToken(autoLoginResponse.accessToken);
    refreshAuth();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800/70 backdrop-blur-sm border border-slate-700 rounded-xl shadow-2xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-4 rounded-xl mb-4">
            <FaLayerGroup className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Terraform Explorer</h1>
          <p className="text-slate-400 mt-1">Configuração inicial – Crie o primeiro usuário</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-slate-200">
              Nome de exibição
            </Label>
            <Input
              id="displayName"
              placeholder="Seu nome ou apelido"
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-slate-200">
              Usuário (login)
            </Label>
            <Input
              id="username"
              placeholder="usuario.admin"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
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
              className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-6 transition-colors"
            disabled={loading}
          >
            {loading ? "Criando usuário..." : "Criar conta de administrador"}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Esta é a configuração inicial do sistema.
        </p>
      </div>
    </div>
  );
}