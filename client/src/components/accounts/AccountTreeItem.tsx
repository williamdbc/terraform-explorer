import { UsedModuleTreeItem } from "@/components/usedModules/UsedModuleTreeItem";
import type { SelectedType } from "@/enums/SelectedType";
import type { Account } from "@/interfaces/TerraformStructure";
import { cn } from "@/lib/utils";
import { ChevronRight, FolderOpen, Folder } from "lucide-react";

interface AccountTreeItemProps {
  account: Account;
  expanded: boolean;
  onToggle: () => void;
  selectedPath: string | null;
  onSelect: (path: string, type: SelectedType) => void;
  expandedItems: Set<string>;
  toggleItem: (path: string) => void;
}

export function AccountTreeItem({
  account,
  expanded,
  onToggle,
  selectedPath,
  onSelect,
  expandedItems,
  toggleItem,
}: AccountTreeItemProps) {
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
          <FolderOpen className="w-4 h-4 text-blue-600" />
        ) : (
          <Folder className="w-4 h-4 text-blue-600" />
        )}
        <span className="font-medium text-slate-900 truncate">{account.name}</span>
        <span className="ml-auto text-xs text-slate-500">{account.usedModules.length}</span>
      </button>

      {expanded && (
        <div className="ml-4">
          {account.usedModules.map(usedModule => (
            <UsedModuleTreeItem
              key={usedModule.path}
              usedModule={usedModule}
              expanded={expandedItems.has(usedModule.path)}
              onToggle={() => toggleItem(usedModule.path)}
              selectedPath={selectedPath}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}


