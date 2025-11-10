import { Button } from "@/components/ui/button";
import { FileCode, Save, Pencil, Trash2, X } from "lucide-react";

interface FileEditorHeaderProps {
  fileName: string;
  modified: boolean;
  isBusy: boolean;
  onSave: () => void;
  onRename: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function FileEditorHeader({
  fileName,
  modified,
  isBusy,
  onSave,
  onRename,
  onDelete,
  onClose,
}: FileEditorHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800">
      <div className="flex items-center gap-2">
        <FileCode className="w-5 h-5 text-slate-400" />
        <h3 className="font-mono text-sm text-slate-100 truncate max-w-md">
          {fileName}
        </h3>
        {modified && (
          <span className="text-xs bg-amber-600 text-amber-100 px-2 py-0.5 rounded">
            Modified
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-md bg-green-600 text-white hover:bg-green-500 disabled:bg-slate-600 disabled:text-slate-400"
          title="Salvar"
          disabled={!modified || isBusy}
          onClick={onSave}
        >
          <Save className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-md bg-orange-600 text-white hover:bg-orange-500 disabled:bg-slate-600 disabled:text-slate-400"
          title="Renomear"
          disabled={isBusy}
          onClick={onRename}
        >
          <Pencil className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-md bg-red-600 text-white hover:bg-red-500 disabled:bg-slate-600 disabled:text-slate-400"
          title="Excluir"
          disabled={isBusy}
          onClick={onDelete}
        >
          <Trash2 className="w-4 h-4" />
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