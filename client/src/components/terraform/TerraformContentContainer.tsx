import { useState } from "react";
import { TerraformContent } from "@/components/terraform/TerraformContent";
import type { TerraformStructure, TerraformModule, Project } from "@/interfaces/TerraformStructure";
import { SelectedType } from "@/enums/SelectedType";
import { useServiceHook } from "@/hooks/useServiceHook";
import { TerraformService } from "@/services/TerraformService";
import type { CommandResponse } from "@/interfaces/responses/CommandResponse";
import type { CommandRequest } from "@/interfaces/requests/CommandRequest";
import { FileCreateDialog } from "@/components/files/FileCreateDialog";
import { FileEditorDialog } from "@/components/files/FileEditorDialog";

interface TerraformContentContainerProps {
  structure: TerraformStructure | null;
  selectedPath: string | null;
  selectedType: SelectedType | null;
  onSelectItem: (path: string, type: SelectedType) => void;
  loadStructure: () => void;
}

export function TerraformContentContainer({
  structure,
  selectedPath,
  selectedType,
  loadStructure
}: TerraformContentContainerProps) {
  const { execute: executeCommand } = useServiceHook(
    (req: CommandRequest) => TerraformService.executeCommand(req)
  );

  const [terminalByPath, setTerminalByPath] = useState<Map<string, CommandResponse[]>>(new Map());
  const [activeTerminalTab, setActiveTerminalTab] = useState<string | null>(null);
  const [executingPaths, setExecutingPaths] = useState<Set<string>>(new Set());

  const handleClearOutput = (tab: string, index: number) => {
    setTerminalByPath((prev) => {
      const copy = new Map(prev);
      const arr = copy.get(tab) ?? [];
      if (index >= 0 && index < arr.length) {
        const newArr = arr.filter((_, i) => i !== index);
        if (newArr.length > 0) {
          copy.set(tab, newArr);
        } else {
          copy.delete(tab);
          if (activeTerminalTab === tab) {
            const keys = Array.from(copy.keys());
            setActiveTerminalTab(keys.length > 0 ? keys[0] : null);
          }
        }
      }
      return copy;
    });
  };

  const handleClearTab = (tab: string) => {
    setTerminalByPath((prev) => {
      const copy = new Map(prev);
      copy.delete(tab);

      if (activeTerminalTab === tab) {
        const keys = Array.from(copy.keys());
        setActiveTerminalTab(keys.length > 0 ? keys[0] : null);
      }
      return copy;
    });
  };


  const handleExecuteCommand = async (cmd: string, path: string) => {
    setExecutingPaths((prev) => new Set(prev).add(path));

    setTerminalByPath((prev) => {
      const copy = new Map(prev);
      if (!copy.has(path)) copy.set(path, []);
      return copy;
    });
    setActiveTerminalTab(path);

    try {
      const result = await executeCommand({ command: cmd, workingDir: path });

      const output: CommandResponse = {
        command: cmd,
        output: result.output,
        exitCode: result.exitCode,
        timestamp: new Date(),
        executionTimeMs: result.executionTimeMs,
        workingDir: path,
      };

      setTerminalByPath((prev) => {
        const copy = new Map(prev);
        const arr = copy.get(path) ?? [];
        copy.set(path, [output, ...arr]);
        return copy;
      });

      setActiveTerminalTab(path);
    } catch (e) {
      const output: CommandResponse = {
        command: cmd,
        output: e instanceof Error ? e.message : "Unknown error",
        exitCode: 1,
        timestamp: new Date(),
        workingDir: path,
        executionTimeMs: 1,
      };
      setTerminalByPath((prev) => {
        const copy = new Map(prev);
        const arr = copy.get(path) ?? [];
        copy.set(path, [output, ...arr]);
        return copy;
      });
      setActiveTerminalTab(path);
    } finally {
      setExecutingPaths((prev) => {
        const copy = new Set(prev);
        copy.delete(path);
        return copy;
      });
    }
  };

  const isSelectedExecuting = selectedPath ? executingPaths.has(selectedPath) : false;

  function getSelectedItem(): TerraformModule | Project | null {
    if (!structure || !selectedPath || !selectedType) return null;

    if (selectedType === SelectedType.Module) {
      return structure.modules.find((m) => m.path === selectedPath) ?? null;
    }

    for (const account of structure.accounts) {
      for (const usedModule of account.usedModules) {
        const project = usedModule.projects.find((p) => p.path === selectedPath);
        if (project) return project;
      }
    }

    return null;
  }

  function hasMainTf(item: TerraformModule | Project | null): boolean {
    return !!item?.files?.some((f) => f.name === "main.tf");
  }

  const selectedItem = getSelectedItem();

  const [showFileDialog, setShowFileDialog] = useState(false);
  const [editingFile, setEditingFile] = useState<{ name: string; path: string } | null>(null);

  return (
    <>
      <TerraformContent
        selectedItem={selectedItem}
        selectedPath={selectedPath}
        hasMainTf={hasMainTf(selectedItem)}
        onExecuteCommand={handleExecuteCommand}
        executing={isSelectedExecuting}
        terminalByPath={terminalByPath}
        activeTerminalTab={activeTerminalTab}
        setActiveTerminalTab={setActiveTerminalTab}
        setEditingFile={setEditingFile}
        setShowFileDialog={setShowFileDialog}
        onClearOutput={handleClearOutput}
        handleClearTab={handleClearTab}
      />

      {showFileDialog && selectedPath && (
        <FileCreateDialog
          open={showFileDialog}
          onClose={() => setShowFileDialog(false)}
          initialPath={selectedPath}
          onCreateSuccess={loadStructure}
        />
      )}

      {editingFile && (
        <FileEditorDialog
          open={!!editingFile}
          onClose={() => setEditingFile(null)}
          fileName={editingFile.name}
          filePath={editingFile.path}
          onSaveSuccess={loadStructure}
          onDeleteSuccess={loadStructure}
        />
      )}
    </>
  );
}