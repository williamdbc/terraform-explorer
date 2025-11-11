import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Loader2, PlayCircle } from "lucide-react";
import { TERRAFORM_ACTIONS } from "@/constants/terraformActions";
import { toast } from "sonner";
import { TerminalTabs } from "@/components/terraform/TerminalTabs";
import type { CommandResponse } from "@/interfaces/responses/CommandResponse";

interface Project {
  name: string;
  path: string;
}

interface ExecuteAllModalProps {
  open: boolean;
  projects: Project[];
  selectedProjects: string[];
  accountName?: string;
  projectGroupName?: string;
  onClose: () => void;
  onExecute: (command: string, selected: string[]) => Promise<CommandResponse[]>;
  onProjectSelectionChange: (paths: string[]) => void;
  loading: boolean;
}

export function ExecuteAllModal({
  open,
  projects,
  selectedProjects,
  accountName,
  projectGroupName,
  onClose,
  onExecute,
  onProjectSelectionChange,
  loading,
}: ExecuteAllModalProps) {
  const [custom, setCustom] = useState("");
  const [terminalOutputs, setTerminalOutputs] = useState<Map<string, CommandResponse[]>>(new Map());
  const [activeTab, setActiveTab] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      onProjectSelectionChange(projects.map(p => p.path));
      setTerminalOutputs(new Map());
      setActiveTab(null);
      setCustom("");
    }
  }, [open, projects, onProjectSelectionChange]);

  if (!open) return null;

  const toggleProject = (projectPath: string, checked: boolean) => {
    const newSelection = checked
      ? Array.from(new Set([...selectedProjects, projectPath]))
      : selectedProjects.filter(p => p !== projectPath);
    onProjectSelectionChange(newSelection);
  };

  const run = async (cmd: string) => {
    if (selectedProjects.length === 0) {
      toast.error("Selecione pelo menos um projeto.");
      return;
    }

    const results = await onExecute(cmd, selectedProjects);

    const outputs = new Map<string, CommandResponse[]>();
    results.forEach(r => {
      const path = r.workingDir || "unknown";
      const existing = outputs.get(path) || [];
      outputs.set(path, [...existing, { ...r }]);
    });

    setTerminalOutputs(outputs);
    setActiveTab(results[0]?.workingDir || null);
    toast.success(`Executado em ${results.length} projeto(s)`);
  };

  const handleClearTab = (tab: string) => {
    setTerminalOutputs(prev => {
      const updated = new Map(prev);
      updated.delete(tab);
      if (activeTab === tab) setActiveTab(null);
      return updated;
    });
  };

  const handleClearOutput = (tab: string, index: number) => {
    setTerminalOutputs(prev => {
      const updated = new Map(prev);
      const outputs = updated.get(tab) || [];
      updated.set(tab, outputs.filter((_, i) => i !== index));
      return updated;
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl max-h-[92vh] overflow-hidden flex flex-col">

        {(accountName || projectGroupName) && (
          <div className="px-6 py-4 border-b flex items-start gap-3 bg-blue-50 border-blue-200">
            <div className="flex-1 min-w-0">
              <div className="mt-2 space-y-1 text-sm text-blue-700">
                {accountName && <p><span className="font-medium">Account:</span> {accountName}</p>}
                {projectGroupName && <p><span className="font-medium">Used Module:</span> {projectGroupName}</p>}
                <p>
                  <span className="font-medium">Projetos:</span> {projects.length}
                  {selectedProjects.length !== projects.length && ` (selecionados: ${selectedProjects.length})`}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-blue-700 hover:bg-blue-200">
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}

        <div className="flex-1 flex overflow-hidden">

          <div className="w-96 min-w-96 border-r border-slate-200 p-6 space-y-6 overflow-auto bg-slate-50">
            <div>
              <Label className="text-sm font-semibold text-slate-900 mb-2 block">
                Projetos ({projects.length})
              </Label>
              <div className="max-h-64 overflow-auto border border-slate-200 rounded-lg p-2 bg-white">
                {projects.map((project) => (
                  <div key={project.path} className="py-1 flex items-center gap-2">
                    <Checkbox
                      checked={selectedProjects.includes(project.path)}
                      onCheckedChange={(checked) => toggleProject(project.path, !!checked)}
                      id={`chk-${project.path}`}
                      disabled={loading}
                    />
                    <label
                      htmlFor={`chk-${project.path}`}
                      className="cursor-pointer text-sm font-mono text-slate-700 select-none truncate block"
                    >
                      {project.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold text-slate-900 mb-3 block">
                Comandos Terraform
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {TERRAFORM_ACTIONS.map((action) => (
                  <Button
                    key={action.id}
                    onClick={() => run(action.command)}
                    disabled={loading}
                    className={`${action.className} w-full text-xs h-9`}
                    size="sm"
                  >
                    {loading ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <action.icon className="w-3 h-3 mr-1" />
                    )}
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
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && custom.trim()) {
                    run(custom.trim());
                  }
                }}
              />
            </div>

            <Button
              onClick={() => custom.trim() && run(custom.trim())}
              disabled={!custom.trim() || loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Executando...
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Executar Customizado
                </>
              )}
            </Button>
          </div>

          <div className="flex-1 flex flex-col bg-slate-900 min-w-0">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                  <p className="text-slate-300 text-lg">Executando em {selectedProjects.length} projeto(s)...</p>
                  <p className="text-slate-500 text-sm mt-2">Aguarde enquanto o backend processa em paralelo</p>
                </div>
              </div>
            ) : terminalOutputs.size > 0 ? (
              <TerminalTabs
                outputs={terminalOutputs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onClearTab={handleClearTab}
                onClearOutput={handleClearOutput}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <PlayCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Selecione projetos e execute um comando</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex gap-3 bg-slate-50">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}