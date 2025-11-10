import { ModuleFiles } from "@/components/terraform/ModuleFiles";
import { TerminalTabs } from "@/components/terraform/TerminalTabs";
import { TerraformActions } from "@/components/terraform/TerraformActions";
import type { CommandResponse } from "@/interfaces/responses/CommandResponse";
import type { TerraformModule, Project } from "@/interfaces/TerraformStructure";
import { Layers } from "lucide-react";

interface TerraformContentProps {
  selectedItem: TerraformModule | Project | null;
  selectedPath: string | null;
  hasMainTf: boolean;
  onExecuteCommand: (cmd: string, path: string) => Promise<void>;
  executing: boolean;
  terminalByPath: Map<string, CommandResponse[]>;
  activeTerminalTab: string | null;
  setActiveTerminalTab: (tab: string | null) => void;
  setEditingFile: (file: { name: string; path: string } | null) => void;
  setShowFileDialog: (show: boolean) => void;
  onClearOutput: (tab: string, index: number) => void;
  handleClearTab: (tab: string) => void;
}

export function TerraformContent({
  selectedItem,
  selectedPath,
  hasMainTf,
  onExecuteCommand,
  executing,
  terminalByPath,
  activeTerminalTab,
  setActiveTerminalTab,
  setEditingFile,
  setShowFileDialog,
  onClearOutput,
  handleClearTab
}: TerraformContentProps) {
  if (!selectedItem) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <Layers className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          Select a Module or Project
        </h2>
        <p className="text-slate-600 max-w-md px-4">
          Choose a Terraform module or project from the directory tree to view
          details and execute commands
        </p>
      </div>
    );
  }

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      <TerraformActions
        path={selectedPath ?? ""}
        hasMainTf={hasMainTf}
        executing={executing}
        onExecute={onExecuteCommand}
      />
      <ModuleFiles
        files={selectedItem.files ?? []}
        onFileSelect={(name, path) => setEditingFile({ name, path })}
        onCreateFile={() => setShowFileDialog(true)}
      />
      <div className="flex-1 flex overflow-hidden">
        <div className="flex h-full w-full">
          <div className="flex-1 h-full">
            <TerminalTabs
              outputs={terminalByPath}
              activeTab={activeTerminalTab}
              onTabChange={setActiveTerminalTab}
              onClearTab={handleClearTab}
              onClearOutput={onClearOutput}
            />
          </div>
        </div>
      </div>
    </main>
  );
}