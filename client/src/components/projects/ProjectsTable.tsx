import { useContext, useState } from "react";
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
import { TrashIcon, Plus, PencilIcon, CopyIcon } from "lucide-react";
import { ProjectCreateDialog } from "@/components/projects/ProjectCreateDialog";
import { ProjectService } from "@/services/ProjectService";
import { useServiceHook } from "@/hooks/useServiceHook";
import { FormSelect } from "@/components/form/FormSelect";
import { ProjectRenameDialog } from "@/components/projects/ProjectRenameDialog";
import { ProjectCopyDialog } from "@/components/projects/ProjectCopyDialog";
import { StructureContext } from "@/contexts/StructureContext";

export function ProjectsTable() {
  const { structure, loadStructure } = useContext(StructureContext);
  const accounts = structure?.accounts ?? [];
  const modules = structure?.modules ?? [];

  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedProjectGroup, setSelectedProjectGroup] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [renamingProjectName, setRenamingProjectName] = useState<string | null>(null);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [copySource, setCopySource] = useState<{ accountName: string; projectGroupName: string; projectName: string } | null>(null);

  const { execute: deleteProject, loading: deleting } = useServiceHook(
    ([accountName, moduleName, projectName]: [string, string, string]) =>
      ProjectService.delete(accountName, moduleName, projectName)
  );

  const projectGroups = !selectedAccount ? [] : accounts.find(acc => acc.name === selectedAccount)?.projectGroups ?? [];

  const projects =
    !selectedAccount || !selectedProjectGroup
      ? []
      : accounts
        .find(acc => acc.name === selectedAccount)
        ?.projectGroups.find(mod => mod.name === selectedProjectGroup)
        ?.projects ?? [];

  const handleAccountChange = (value: string) => {
    setSelectedAccount(value);
    setSelectedProjectGroup("");
  };

  const handleProjectGroupChange = (value: string) => setSelectedProjectGroup(value);

  const openCreateDialog = () => {
    if (!selectedAccount) {
      toast.error("Selecione uma conta primeiro");
      return;
    }
    if (!selectedProjectGroup) {
      toast.error("Selecione um grupo de projetos primeiro");
      return;
    }
    setShowCreate(true);
  };

  const closeCreateDialog = () => setShowCreate(false);

  const handleCreateSuccess = () => {
    closeCreateDialog();
    loadStructure();
  };

  const openRenameDialog = (projectName: string) => {
    setRenamingProjectName(projectName);
    setShowRenameDialog(true);
  };

  const closeRenameDialog = () => {
    setShowRenameDialog(false);
    setRenamingProjectName(null);
  };

  const handleRenameSuccess = () => {
    closeRenameDialog();
    loadStructure();
  };

  const openCopyDialog = (accountName: string, projectGroupName: string, projectName: string) => {
    setCopySource({ accountName, projectGroupName: projectGroupName, projectName });
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

  const openDeleteConfirm = (projectName: string) => {
    setProjectToDelete(projectName);
    setConfirmDeleteOpen(true);
  };

  const closeDeleteConfirm = () => {
    setConfirmDeleteOpen(false);
    setProjectToDelete(null);
  };

  const handleDelete = async () => {
    if (!projectToDelete || !selectedAccount || !selectedProjectGroup) return;

    await deleteProject([selectedAccount, selectedProjectGroup, projectToDelete]);
    toast.success(`Projeto "${projectToDelete}" excluído com sucesso`);
    closeDeleteConfirm();
    loadStructure();
  };

  return (
    <div className="p-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Projetos</h2>
        <Button
          onClick={openCreateDialog}
          className="bg-green-600 hover:bg-green-700 text-white"
          disabled={!selectedAccount || !selectedProjectGroup}
        >
          <Plus className="w-4 h-4 mr-2" /> Adicionar
        </Button>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="w-64">
          <FormSelect
            label="Filtrar por conta"
            value={selectedAccount}
            onValueChange={handleAccountChange}
            options={accounts.map(acc => ({ value: acc.name, label: acc.name }))}
            placeholder="Selecione a conta"
          />
        </div>

        <div className="w-64">
          <FormSelect
            label="Filtrar por grupo de projetos"
            value={selectedProjectGroup}
            onValueChange={handleProjectGroupChange}
            options={projectGroups.map(mod => ({ value: mod.name, label: mod.name }))}
            placeholder="Selecione o grupo de projetos"
            disabled={!selectedAccount}
          />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-200 bg-slate-50">
              <TableHead className="font-semibold text-slate-700">Nome</TableHead>
              <TableHead className="text-right font-semibold text-slate-700">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!selectedAccount ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-slate-500 py-8">
                  Selecione uma conta para visualizar os projetos
                </TableCell>
              </TableRow>
            ) : !selectedProjectGroup ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-slate-500 py-8">
                  Selecione um grupo de projetos para visualizar os projetos
                </TableCell>
              </TableRow>
            ) : projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-slate-500 py-8">
                  Nenhum projeto encontrado neste grupo de projetos
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project, index) => (
                <TableRow
                  key={project.name}
                  className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${index === projects.length - 1 ? "border-b-0" : ""
                    }`}
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-800">{project.name}</span>
                      <span className="text-xs text-slate-500 font-normal">{project.path}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Copiar projeto"
                      onClick={() => openCopyDialog(selectedAccount, selectedProjectGroup, project.name)}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <CopyIcon className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-md bg-orange-500 text-white hover:bg-orange-400"
                      title="Renomear"
                      onClick={() => openRenameDialog(project.name)}
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-md bg-red-500 text-white hover:bg-red-400 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                      title="Excluir"
                      disabled={deleting}
                      onClick={() => openDeleteConfirm(project.name)}
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

      <ProjectCreateDialog
        open={showCreate}
        onClose={closeCreateDialog}
        accountName={selectedAccount}
        projectGroupName={selectedProjectGroup}
        accounts={accounts}
        modules={modules}
        onCreateSuccess={handleCreateSuccess}
      />

      <ProjectCopyDialog
        open={showCopyDialog}
        onClose={closeCopyDialog}
        accountName={copySource?.accountName ?? ""}
        projectGroupName={copySource?.projectGroupName ?? ""}
        projectName={copySource?.projectName ?? ""}
        accounts={accounts}
        onCopySuccess={handleCopySuccess}
      />

      <ProjectRenameDialog
        open={showRenameDialog}
        onClose={closeRenameDialog}
        accountName={selectedAccount}
        projectGroupName={selectedProjectGroup}
        projectName={renamingProjectName ?? ""}
        onRenameSuccess={handleRenameSuccess}
      />

      <ConfirmDialog
        open={confirmDeleteOpen}
        onCancel={closeDeleteConfirm}
        onConfirm={handleDelete}
        title="Confirma exclusão"
        description={`Confirma a exclusão do projeto "${projectToDelete}"?`}
        cancelText="Cancelar"
        confirmText="Excluir"
        type="delete"
      />
    </div>
  );
}