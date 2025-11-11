import type { Project } from "@/interfaces/TerraformStructure";
import { cn } from "@/lib/utils";
import { FaRocket } from "react-icons/fa";

interface ProjectExplorerItemProps {
  project: Project;
  selected: boolean;
  onSelect: () => void;
}

export function ProjectExplorerItem({ project, selected, onSelect }: ProjectExplorerItemProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors text-left group",
        selected ? "bg-blue-100 text-blue-900 font-medium" : "hover:bg-slate-200/70 text-slate-700"
      )}
    >
      <FaRocket className={`w-4 h-4 ${selected ? "text-emerald-500" : "text-emerald-500"}`} />
      <span className="truncate">{project.name}</span>
    </button>
  );
}
