import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import { TERRAFORM_ACTIONS } from "@/constants/terraformActions";
import { toast } from "sonner";

interface Project {
  name: string;
  path: string;
}

interface ExecuteAllModalProps {
  open: boolean;
  projects: Project[];
  selectedProjects: string[];
  accountName?: string;
  usedModuleName?: string;
  onClose: () => void;
  onExecute: (command: string, selected: string[]) => void;
  onProjectSelectionChange: (paths: string[]) => void;
}

export function ExecuteAllModal({
  open,
  projects,
  selectedProjects,
  accountName,
  usedModuleName,
  onClose,
  onExecute,
  onProjectSelectionChange,
}: ExecuteAllModalProps) {
  const [custom, setCustom] = useState("");

  useEffect(() => {
    if (open) {
      onProjectSelectionChange(projects.map(p => p.path));
    }
  }, [open, projects, onProjectSelectionChange]);

  if (!open) return null;

  const toggleProject = (project: string, checked: boolean) => {
    const newSelection = checked
      ? Array.from(new Set([...selectedProjects, project]))
      : selectedProjects.filter(p => p !== project);
    onProjectSelectionChange(newSelection);
  };

  const run = (cmd: string) => {
    if (selectedProjects.length === 0) {
      toast.error("Selecione pelo menos um projeto.");
      return;
    }
    onExecute(cmd, selectedProjects);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">

        {(accountName || usedModuleName) && (
          <div className="px-6 py-4 border-b flex items-start gap-3 bg-blue-50 border-blue-200 rounded-t-lg">
            <div className="flex-1 min-w-0">
              <div className="mt-2 space-y-1 text-sm text-blue-700">
                {accountName && <p><span className="font-medium">Account:</span> {accountName}</p>}
                {usedModuleName && <p><span className="font-medium">Used Module:</span> {usedModuleName}</p>}
                <p>
                  <span className="font-medium">Projetos:</span> {projects.length} 
                  {selectedProjects.length !== projects.length && ` (selecionados: ${selectedProjects.length})`}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-blue-700 hover:bg-blue-200"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}

        <div className="p-6 space-y-6 overflow-auto flex-1">

          <div>
            <Label className="text-sm font-semibold text-slate-900 mb-2 block">
              Projetos ({projects.length})
            </Label>
            <div className="max-h-48 overflow-auto border border-slate-200 rounded-lg p-2">
              {projects.map((project) => (
                <div key={project.path} className="py-1 flex items-center gap-2">
                  <Checkbox
                    checked={selectedProjects.includes(project.path)}
                    onCheckedChange={(checked) => toggleProject(project.path, !!checked)}
                    id={`chk-${project.path}`}
                  />
                  <label
                    htmlFor={`chk-${project}`}
                    className="cursor-pointer text-sm font-mono text-slate-700 select-none"
                  >
                    • {project.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold text-slate-900 mb-3 block">
              Terraform Commands
            </Label>
            <div className="grid grid-cols-4 gap-3">
              {TERRAFORM_ACTIONS.map((action) => (
                <Button
                  key={action.id}
                  onClick={() => run(action.command)}
                  className={`${action.className} w-full`}
                  size="default"
                >
                  <action.icon className="w-4 h-4 mr-2" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="custom-command" className="text-sm font-semibold text-slate-900 mb-2 block">
              Comando Customizado
            </Label>
            <Input
              id="custom-command"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="ex: terraform plan -var 'x=1'"
              className="font-mono text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && custom.trim()) {
                  run(custom.trim());
                }
              }}
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
          <Button
            onClick={() => custom.trim() && run(custom.trim())}
            disabled={!custom.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Executar Comando Customizado
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}