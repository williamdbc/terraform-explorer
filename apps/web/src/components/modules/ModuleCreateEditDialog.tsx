import * as React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useServiceHook } from "@/hooks/useServiceHook";
import { ModuleService } from "@/services/ModuleService";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { FormInput } from "@/components/form/FormInput";
import type { CreateItemRequest } from "@/interfaces/requests/CreateItemRequest";
import type { RenameRequest } from "@/interfaces/requests/RenameRequest";
import { DialogFooterButtons } from "@/components/dialogs/DialogFooterButtons";

interface ModuleCreateEditDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  initialName?: string;
  onCreateSuccess?: () => void;
  onEditSuccess?: () => void;
}

export function ModuleCreateEditDialog({
  open,
  onClose,
  mode,
  initialName = "",
  onCreateSuccess,
  onEditSuccess,
}: ModuleCreateEditDialogProps) {
  const [moduleName, setModuleName] = useState(mode === "create" ? "" : initialName);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { execute: createModule, loading: loadingCreate } = useServiceHook(
    (req: CreateItemRequest) => ModuleService.create(req)
  );

  const { execute: renameModule, loading: loadingRename } = useServiceHook(
    ([oldName, renameReq]: [string, RenameRequest]) => ModuleService.rename(oldName, renameReq)
  );

  useEffect(() => {
    setModuleName(mode === "create" ? "" : initialName);
  }, [initialName, mode]);

  const loading = mode === "create" ? loadingCreate : loadingRename;

  const validateForm = () => {
    if (!moduleName.trim()) {
      toast.error("Nome do módulo é obrigatório.");
      return false;
    }
    if (mode === "edit" && moduleName.trim() === initialName) {
      toast("Nenhuma alteração feita no nome.");
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setConfirmOpen(false);

    if (mode === "create") {
      await createModule({ name: moduleName.trim() });
      toast.success("Módulo criado com sucesso.");
      onCreateSuccess?.();
    } else {
      await renameModule([initialName, { newName: moduleName.trim() }]);
      toast.success("Módulo renomeado com sucesso.");
      onEditSuccess?.();
    }

    onClose();
    setModuleName("");
  };

  if (!open) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={o => !o && onClose()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "Novo módulo" : "Editar módulo"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-2">
            <FormInput
              id="module-name-input"
              label="Nome do módulo"
              value={moduleName}
              onChange={e => setModuleName(e.target.value)}
              placeholder="nome-do-modulo"
              disabled={loading}
            />

            <DialogFooterButtons
              loading={loading}
              onCancel={onClose}
              confirmText={mode === "create" ? "Criar" : "Salvar"}
              type={mode === "create" ? "create" : "edit"}
            />
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        title={mode === "create" ? "Novo módulo" : "Editar módulo"}
        description={mode === "create"
          ? `Deseja realmente criar o módulo "${moduleName.trim()}"?`
          : `Deseja renomear o módulo para "${moduleName.trim()}"?`}
        cancelText="Cancelar"
        confirmText={mode === "create" ? "Criar" : "Salvar"}
        type={mode === "create" ? "create" : "edit"}
      />
    </>
  );
}