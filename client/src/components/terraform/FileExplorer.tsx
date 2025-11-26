import { useContext, useState } from "react";
import { StructureContext } from "@/contexts/StructureContext";
import {
  Server,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SelectedType } from "@/enums/SelectedType";
import { AccountTreeItem } from "@/components/accounts/AccountTreeItem";
import { FaCubes } from "react-icons/fa";

interface FileExplorerProps {
  selectedPath: string | null;
  onSelect: (path: string, type: SelectedType) => void;
}

export function FileExplorer({
  selectedPath,
  onSelect,
}: FileExplorerProps) {
  const { structure } = useContext(StructureContext);
  const accounts = structure?.accounts ?? [];
  const modules = structure?.modules ?? [];

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (path: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 border-r border-slate-200">
      <div className="flex-1 overflow-auto">
        <div className="p-2">

          <div className="mb-4">
            <div className="flex items-center px-2 py-1 text-xs font-medium text-slate-500 uppercase tracking-wider">
              <Server className="w-3.5 h-3.5 mr-1 text-amber-600" />
              Contas AWS
            </div>
            {accounts.map(account => (
              <AccountTreeItem
                key={account.name}
                account={account}
                expanded={expandedItems.has(account.name)}
                onToggle={() => toggleItem(account.name)}
                selectedPath={selectedPath}
                onSelect={onSelect}
                expandedItems={expandedItems}
                toggleItem={toggleItem}
              />
            ))}
          </div>

          <div>
            <div className="flex items-center px-2 py-1 text-xs font-medium text-slate-500 uppercase tracking-wider">
              <Package className="w-3.5 h-3.5 mr-1 text-amber-600" />
              Módulos de Infra
            </div>
            {modules.map(module => (
              <button
                key={module.name}
                onClick={() => onSelect(module.path, SelectedType.Module)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors text-left",
                  selectedPath === module.path
                    ? "bg-blue-100 text-blue-900 font-medium"
                    : "hover:bg-slate-200 text-slate-700"
                )}
              >
                <FaCubes className="w-4 h-4 shrink-0 text-violet-600" />
                <span title={module.name} className="truncate">{module.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
