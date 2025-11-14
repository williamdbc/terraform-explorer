import { Button } from "@/components/ui/button";
import { FilePlus, Save, X } from "lucide-react";

interface FileCreateHeaderProps {
  isBusy: boolean;
  canSave: boolean;
  onSave: () => void;
  onClose: () => void;
}

export function FileCreateHeader({
  isBusy,
  canSave,
  onSave,
  onClose,
}: FileCreateHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800">
      <div className="flex items-center gap-2">
        <FilePlus className="w-5 h-5 text-slate-400" />
        <h3 className="font-mono text-sm text-slate-100">Novo Arquivo</h3>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-md bg-green-600 text-white hover:bg-green-500 disabled:bg-slate-600 disabled:text-slate-400"
          title="Criar"
          disabled={!canSave || isBusy}
          onClick={onSave}
        >
          <Save className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-md bg-slate-600 text-white hover:bg-slate-500"
          title="Fechar"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}