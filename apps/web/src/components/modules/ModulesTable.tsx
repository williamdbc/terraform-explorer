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
import { PencilIcon, TrashIcon, Plus } from "lucide-react";
import { ModuleCreateEditDialog } from "@/components/modules/ModuleCreateEditDialog";
import { ModuleService } from "@/services/ModuleService";
import { useServiceHook } from "@/hooks/useServiceHook";
import { StructureContext } from "@/contexts/StructureContext";

export function ModulesTable() {
  const { structure, loadStructure } = useContext(StructureContext);
  const modules = structure?.modules ?? [];

  const [showDialog, setShowDialog] = useState(false);
  const [editingModuleName, setEditingModuleName] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState<string | null>(null);

  const { execute: deleteModule, loading: deleting } = useServiceHook(
    (name: string) => ModuleService.delete(name)
  );

  const openCreateDialog = () => {
    setEditingModuleName(null);
    setShowDialog(true);
  };

  const openEditDialog = (moduleName: string) => {
    setEditingModuleName(moduleName);
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditingModuleName(null);
  };

  const handleSuccess = () => {
    closeDialog();
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
    if (!moduleToDelete) return;

    await deleteModule(moduleToDelete);
    toast.success(`Módulo "${moduleToDelete}" excluído com sucesso.`);
    closeDeleteConfirm();
    loadStructure();
  };

  return (
    <div className="p-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Módulos</h2>
        <Button
          onClick={openCreateDialog}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" /> Adicionar
        </Button>
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
            {modules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-slate-500 py-8">
                  Nenhum módulo encontrado
                </TableCell>
              </TableRow>
            ) : (
              modules.map((mod, index) => (
                <TableRow
                  key={mod.name}
                  className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${index === modules.length - 1 ? "border-b-0" : ""
                    }`}
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-800">{mod.name}</span>
                      <span className="text-xs text-slate-500 font-normal">{mod.path}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-md bg-orange-500 text-white hover:bg-orange-400 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                      title="Editar"
                      onClick={() => openEditDialog(mod.name)}
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-md bg-red-500 text-white hover:bg-red-400 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
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

      <ModuleCreateEditDialog
        open={showDialog}
        onClose={closeDialog}
        mode={editingModuleName ? "edit" : "create"}
        initialName={editingModuleName ?? undefined}
        onCreateSuccess={handleSuccess}
        onEditSuccess={handleSuccess}
      />

      <ConfirmDialog
        open={confirmDeleteOpen}
        onCancel={closeDeleteConfirm}
        onConfirm={handleDelete}
        title="Confirma exclusão"
        description={`Confirma a exclusão do módulo "${moduleToDelete}"?`}
        cancelText="Cancelar"
        confirmText="Excluir"
        type="delete"
      />
    </div>
  );
}