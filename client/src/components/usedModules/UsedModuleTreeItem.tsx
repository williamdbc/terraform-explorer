import { ProjectExplorerItem } from "@/components/projects/ProjectExplorerItem";
import { SelectedType } from "@/enums/SelectedType";
import type { UsedModule } from "@/interfaces/TerraformStructure";
import { cn } from "@/lib/utils";
import { ChevronRight, FolderOpen, Folder } from "lucide-react";

interface UsedModuleTreeItemProps {
  usedModule: UsedModule;
  expanded: boolean;
  onToggle: () => void;
  selectedPath: string | null;
  onSelect: (path: string, type: SelectedType) => void;
}

export function UsedModuleTreeItem({
  usedModule,
  expanded,
  onToggle,
  selectedPath,
  onSelect,
}: UsedModuleTreeItemProps) {
  return (
    <div className="select-none">
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center gap-1 px-2 py-1.5 text-sm rounded-md transition-colors text-left group",
          expanded ? "bg-slate-200/50" : "hover:bg-slate-200/50"
        )}
      >
        <ChevronRight
          className={cn(
            "w-4 h-4 text-slate-500 transition-transform",
            expanded && "rotate-90"
          )}
        />
        {expanded ? (
          <FolderOpen className="w-4 h-4 text-amber-600" />
        ) : (
          <Folder className="w-4 h-4 text-amber-600" />
        )}
        <span className="text-slate-800 truncate">{usedModule.name}</span>
        <span className="ml-auto text-xs text-slate-500">{usedModule.projects.length}</span>
      </button>

      {expanded && (
        <div className="ml-4">
          {usedModule.projects.map(project => (
            <ProjectExplorerItem
              key={project.path}
              project={project}
              selected={selectedPath === project.path}
              onSelect={() => onSelect(project.path, SelectedType.Project)}
            />
          ))}
        </div>
      )}
    </div>
  );
}