import { Input } from "@/components/ui/input";

interface FileCreateNameInputProps {
  fileName: string;
  initialPath?: string;
  disabled: boolean;
  onChange: (value: string) => void;
}

export function FileCreateNameInput({
  fileName,
  initialPath = "",
  disabled,
  onChange,
}: FileCreateNameInputProps) {
  const fullPath = initialPath ? `${initialPath}/${fileName}`.replace(/\/+/g, "/") : fileName;

  return (
    <div className="px-4 py-3 bg-slate-800 border-b border-slate-700">
      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-400 w-20">Nome:</label>
        <Input
          value={fileName}
          onChange={(e) => onChange(e.target.value)}
          placeholder="main.tf"
          className="flex-1 bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-500 focus:ring-green-500"
          disabled={disabled}
          autoFocus
        />
      </div>
      {initialPath && (
        <p className="text-xs text-slate-400 mt-1 ml-20">
          Caminho: <code className="text-slate-300">{fullPath || "..."}</code>
        </p>
      )}
    </div>
  );
}