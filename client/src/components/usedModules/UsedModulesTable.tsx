import { useState, useContext } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { PencilIcon, TrashIcon, Plus, PlayCircle, CopyIcon } from "lucide-react";
import { UsedModuleCreateEditDialog } from "@/components/usedModules/UsedModuleCreateEditDialog";
import { UsedModuleService } from "@/services/UsedModuleService";
import { useServiceHook } from "@/hooks/useServiceHook";
import { FormSelect } from "@/components/form/FormSelect";
import { ExecuteAllModal } from "@/components/dialogs/ExecuteAllModal";
import { UsedModuleCopyDialog } from "@/components/usedModules/UsedModuleCopyDialog";
import { TerraformService } from "@/services/TerraformService";
import { StructureContext } from "@/contexts/StructureContext";
import type { CommandResponse } from "@/interfaces/responses/CommandResponse";

export function UsedModulesTable() {
  const { structure, loadStructure } = useContext(StructureContext);
  const accounts = structure?.accounts ?? [];

  const [selectedAccount, setSelectedAccount] = useState("");
  const [showCreateEdit, setShowCreateEdit] = useState(false);
  const [editingModuleName, setEditingModuleName] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState<string | null>(null);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [copySource, setCopySource] = useState<{ accountName: string; moduleName: string } | null>(null);

  const [executeModalOpen, setExecuteModalOpen] = useState(false);
  const [executeProjects, setExecuteProjects] = useState<string[]>([]);
  const [allModuleProjects, setAllModuleProjects] = useState<{ name: string; path: string }[]>([]);
  const [executeAccount, setExecuteAccount] = useState<string | undefined>(undefined);
  const [executeUsedModule, setExecuteUsedModule] = useState<string | undefined>(undefined);

  const account = accounts.find(acc => acc.name === selectedAccount);
  const usedModules = selectedAccount ? account?.usedModules ?? [] : [];

  const accountOptions = accounts.map(acc => ({ value: acc.name, label: acc.name }));

  const { execute: deleteUsedModule, loading: deleting } = useServiceHook(
    ([accountName, moduleName]: [string, string]) => UsedModuleService.delete(accountName, moduleName)
  );

  const { execute: executeAllCommand, loading: executingAllLoading } = useServiceHook(
    (req: { command: string; workingDirs: string[] }) => TerraformService.executeAll(req)
  );

  const handleAccountChange = (value: string) => {
    setSelectedAccount(value);
  };

  const openCreateDialog = () => {
    if (!selectedAccount) {
      toast.error("Selecione uma conta primeiro");
      return;
    }
    setEditingModuleName(null);
    setShowCreateEdit(true);
  };

  const openEditDialog = (moduleName: string) => {
    setEditingModuleName(moduleName);
    setShowCreateEdit(true);
  };

  const closeCreateEditDialog = () => {
    setShowCreateEdit(false);
    setEditingModuleName(null);
  };

  const handleCreateEditSuccess = () => {
    closeCreateEditDialog();
    loadStructure();
  };

  const openCopyDialog = (accountName: string, moduleName: string) => {
    setCopySource({ accountName, moduleName });
    setShowCopyDialog(true);
  };

  const closeCopyDialog = () => {
    setShowCopyDialog(false);
    setCopySource(null);
  };

  const handleCopySuccess = () => {
    closeCopyDialog();
    loadStructure();
  };

  const openDeleteConfirm = (moduleName: string) => {
    setModuleToDelete(moduleName);
    setConfirmDeleteOpen(true);
  };

  const closeDeleteConfirm = () => {
    setConfirmDeleteOpen(false);
    setModuleToDelete(null);
  };

  const handleDelete = async () => {
    if (!moduleToDelete || !selectedAccount) return;

    await deleteUsedModule([selectedAccount, moduleToDelete]);
    toast.success(`Used Module "${moduleToDelete}" excluído com sucesso`);
    closeDeleteConfirm();
    loadStructure();
  };

  const openExecuteModalForModule = (accountName: string, moduleName: string) => {
    const acc = accounts.find(acc => acc.name === accountName);
    const usedModule = acc?.usedModules.find(mod => mod.name === moduleName);
    if (!usedModule) return;

    const projects = usedModule.projects.map(proj => ({
      name: proj.name,
      path: proj.path,
    }));

    setExecuteAccount(accountName);
    setExecuteUsedModule(moduleName);
    setAllModuleProjects(projects);
    setExecuteProjects(projects.map(p => p.path));
    setExecuteModalOpen(true);
  };

  const handleExecuteSelected = async (command: string, selected: string[]): Promise<CommandResponse[]> => {
    if (selected.length === 0) {
      toast.error("Nenhum projeto selecionado.");
      return [];
    }

    const response = await executeAllCommand({ command, workingDirs: selected });
    return response.results.map((r, i) => ({
      ...r,
      command: command,
      workingDir: selected[i] || "unknown",
      timestamp: new Date(),
    }));
  };

  return (
    <div className="p-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Used Modules</h2>
        <div className="flex gap-2">
          <Button
            onClick={openCreateDialog}
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={!selectedAccount}
          >
            <Plus className="w-4 h-4 mr-2" /> Adicionar
          </Button>
        </div>
      </div>

      <div className="mb-6 max-w-xs">
        <FormSelect
          label="Filtrar por conta"
          value={selectedAccount}
          onValueChange={handleAccountChange}
          options={accountOptions}
          placeholder="Selecione a conta"
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-200 bg-slate-50">
              <TableHead className="font-semibold text-slate-700">Nome</TableHead>
              <TableHead className="text-center font-semibold text-slate-700">Projetos</TableHead>
              <TableHead className="text-right font-semibold text-slate-700">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!selectedAccount ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-slate-500 py-8">
                  Selecione uma conta para visualizar os used modules
                </TableCell>
              </TableRow>
            ) : usedModules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-slate-500 py-8">
                  Nenhum used module encontrado nesta conta
                </TableCell>
              </TableRow>
            ) : (
              usedModules.map((mod, index) => (
                <TableRow
                  key={mod.name}
                  className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                    index === usedModules.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-800">{mod.name}</span>
                      <span className="text-xs text-slate-500 font-normal">{mod.path}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                      {mod.projects.length}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-md bg-green-600 text-white hover:bg-green-700"
                      title="Executar todos os projetos"
                      onClick={() => openExecuteModalForModule(selectedAccount, mod.name)}
                    >
                      <PlayCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                      title="Copiar"
                      onClick={() => openCopyDialog(selectedAccount, mod.name)}
                    >
                      <CopyIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-md bg-orange-500 text-white hover:bg-orange-400"
                      title="Editar"
                      onClick={() => openEditDialog(mod.name)}
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-md bg-red-500 text-white hover:bg-red-400"
                      title="Excluir"
                      disabled={deleting}
                      onClick={() => openDeleteConfirm(mod.name)}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <UsedModuleCreateEditDialog
        open={showCreateEdit}
        onClose={closeCreateEditDialog}
        mode={editingModuleName ? "edit" : "create"}
        accountName={selectedAccount}
        initialName={editingModuleName ?? undefined}
        accounts={accounts}
        onCreateSuccess={handleCreateEditSuccess}
        onEditSuccess={handleCreateEditSuccess}
      />

      <UsedModuleCopyDialog
        open={showCopyDialog}
        onClose={closeCopyDialog}
        accounts={accounts}
        accountName={copySource?.accountName ?? ""}
        usedModuleName={copySource?.moduleName ?? ""}
        onCopySuccess={handleCopySuccess}
      />

      <ConfirmDialog
        open={confirmDeleteOpen}
        onCancel={closeDeleteConfirm}
        onConfirm={handleDelete}
        title="Confirma exclusão"
        description={`Confirma a exclusão do used module "${moduleToDelete}"?`}
        cancelText="Cancelar"
        confirmText="Excluir"
        type="delete"
      />

      <ExecuteAllModal
        open={executeModalOpen}
        projects={allModuleProjects}
        selectedProjects={executeProjects}
        accountName={executeAccount}
        usedModuleName={executeUsedModule}
        onClose={() => setExecuteModalOpen(false)}
        onExecute={handleExecuteSelected}
        onProjectSelectionChange={setExecuteProjects}
        loading={executingAllLoading}
      />
    </div>
  );
}