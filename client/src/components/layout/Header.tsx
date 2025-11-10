import {
  FaFolderPlus,
  FaBolt,
  FaAws,
  FaSyncAlt,
  FaUser,
  FaCubes,
} from "react-icons/fa";
import { ButtonWithTooltip } from "@/components/common/ButtonWithTooltipProps";
import { LogoTitle } from "./LogoTitle";
import type { AppView } from "@/types/AppView";

interface HeaderProps {
  setActiveView: (view: AppView) => void;
  loadStructure: () => void;
}

export function Header({ loadStructure, setActiveView }: HeaderProps) {

  return (
    <header className="bg-linear-to-r from-slate-900 to-slate-800 text-white px-6 py-4 shadow-lg flex items-center">
      <LogoTitle />

      <div className="grow flex items-center justify-center gap-3">
        <ButtonWithTooltip
          text="Projetos"
          bgColorClass="bg-green-600 hover:bg-green-700"
          ariaLabel="Projetos"
          onClick={() => setActiveView("projects")}
          icon={<FaFolderPlus className="w-5 h-5" />}
        />
        <ButtonWithTooltip
          text="Contas"
          bgColorClass="bg-blue-600 hover:bg-blue-700"
          ariaLabel="Contas"
          onClick={() => setActiveView("accounts")}
          icon={<FaUser className="w-5 h-5" />}
        />
        <ButtonWithTooltip
          text="Used Modules"
          bgColorClass="bg-blue-600 hover:bg-blue-700"
          ariaLabel="Used Modules"
          onClick={() => setActiveView("usedModules")}
          icon={<FaCubes className="w-5 h-5" />}
        />
        <ButtonWithTooltip
          text="Módulos"
          bgColorClass="bg-violet-600 hover:bg-violet-700"
          ariaLabel="Módulos"
          onClick={() => setActiveView("modules")}
          icon={<FaBolt className="w-5 h-5" />}
        />
        <ButtonWithTooltip
          text="AWS"
          bgColorClass="bg-orange-600 hover:bg-orange-700"
          ariaLabel="AWS"
          onClick={() => setActiveView("providers")}
          icon={<FaAws className="w-5 h-5" />}
        />
        <ButtonWithTooltip
          text="Atualizar estrutura"
          bgColorClass="bg-gray-700 hover:bg-gray-600"
          ariaLabel="Atualizar estrutura"
          onClick={() => loadStructure()}
          icon={<FaSyncAlt className="w-5 h-5" />}
        />
      </div>

      <div className="w-1/4" />
    </header>
  );
}
