import {
  FaAws,
  FaSyncAlt,
  FaCubes,
  FaCloud,
  FaFolderOpen,
  FaRocket,
  FaSignOutAlt,
} from "react-icons/fa";
import { ButtonWithTooltip } from "@/components/common/ButtonWithTooltipProps";
import { LogoTitle } from "./LogoTitle";
import type { AppView } from "@/types/AppView";
import { useContext } from "react";
import { StructureContext } from "@/contexts/StructureContext";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  setActiveView: (view: AppView) => void;
}

export function Header({ setActiveView }: HeaderProps) {
  const { loadStructure } = useContext(StructureContext);
  const currentUser = useCurrentUser();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.info("Você saiu da conta.");
  };

  return (
    <header className="bg-linear-to-r from-slate-900 to-slate-800 text-white px-6 py-4 shadow-lg flex items-center justify-between">
      <LogoTitle />

      <div className="grow flex items-center justify-center gap-3">
        <ButtonWithTooltip
          text="Providers AWS"
          bgColorClass="bg-teal-600 hover:bg-teal-700"
          ariaLabel="Providers AWS"
          onClick={() => setActiveView("providers")}
          icon={<FaAws className="w-5 h-5" />}
        />
        <ButtonWithTooltip
          text="Módulos"
          bgColorClass="bg-violet-600 hover:bg-violet-700"
          ariaLabel="Módulos"
          onClick={() => setActiveView("modules")}
          icon={<FaCubes className="w-5 h-5" />}
        />
        <ButtonWithTooltip
          text="Contas AWS"
          bgColorClass="bg-orange-600 hover:bg-orange-700"
          ariaLabel="Contas AWS"
          onClick={() => setActiveView("accounts")}
          icon={<FaCloud className="w-5 h-5" />}
        />
        <ButtonWithTooltip
          text="Grupo de Projetos"
          bgColorClass="bg-purple-600 hover:bg-purple-700"
          ariaLabel="Grupo de Projetos"
          onClick={() => setActiveView("projectGroups")}
          icon={<FaFolderOpen className="w-5 h-5" />}
        />
        <ButtonWithTooltip
          text="Projetos"
          bgColorClass="bg-emerald-600 hover:bg-emerald-700"
          ariaLabel="Projetos"
          onClick={() => setActiveView("projects")}
          icon={<FaRocket className="w-5 h-5" />}
        />
        <ButtonWithTooltip
          text="Atualizar estrutura"
          bgColorClass="bg-gray-700 hover:bg-gray-600"
          ariaLabel="Atualizar estrutura"
          onClick={() => loadStructure()}
          icon={<FaSyncAlt className="w-5 h-5" />}
        />
      </div>

      <div className="flex items-center gap-4 w-1/4 justify-end">
        {currentUser ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-300">
              Olá, <span className="font-medium text-white">{currentUser.displayName}</span>
            </span>

            <ButtonWithTooltip
              text="Sair"
              bgColorClass="bg-red-600 hover:bg-red-700"
              ariaLabel="Sair da conta"
              onClick={handleLogout}
              icon={<FaSignOutAlt className="w-5 h-5" />}
            />
          </div>
        ) : (
          <span className="text-sm text-slate-400">Não autenticado</span>
        )}
      </div>
    </header>
  );
}