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
import { ProjectGroupService } from "@/services/ProjectGroupService";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { FormInput } from "@/components/form/FormInput";
import { FormSelect } from "@/components/form/FormSelect";
import type { CreateItemRequest } from "@/interfaces/requests/CreateItemRequest";
import type { RenameRequest } from "@/interfaces/requests/RenameRequest";
import type { Account } from "@/interfaces/TerraformStructure";
import { DialogFooterButtons } from "@/components/dialogs/DialogFooterButtons";

interface ProjectGroupCreateEditDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  accountName: string;
  initialName?: string;
  accounts: Account[];
  onCreateSuccess?: () => void;
  onEditSuccess?: () => void;
}

export function ProjectGroupCreateEditDialog({
  open,
  onClose,
  mode,
  accountName,
  initialName = "",
  accounts,
  onCreateSuccess,
  onEditSuccess,
}: ProjectGroupCreateEditDialogProps) {
  const [moduleName, setModuleName] = useState(mode === "create" ? "" : initialName);
  const [selectedAccount, setSelectedAccount] = useState(accountName);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { execute: createModule, loading: loadingCreate } = useServiceHook(
    ([accName, req]: [string, CreateItemRequest]) => ProjectGroupService.create(accName, req)
  );

  const { execute: renameModule, loading: loadingRename } = useServiceHook(
    ([accName, oldName, renameReq]: [string, string, RenameRequest]) => ProjectGroupService.rename(accName, oldName, renameReq)
  );

  const loading = mode === "create" ? loadingCreate : loadingRename;

  useEffect(() => {
    setModuleName(mode === "create" ? "" : initialName);
    setSelectedAccount(accountName);
  }, [initialName, accountName, mode]);

  const accountOptions = accounts.map(acc => ({ value: acc.name, label: acc.name }));

  const validateForm = (): boolean => {
    if (mode === "create" && !selectedAccount) {
      toast.error("Conta é obrigatória.");
      return false;
    }
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
      await createModule([selectedAccount, { name: moduleName.trim() }]);
      toast.success("Grupo de projetos criado com sucesso.");
      onCreateSuccess?.();
    } else {
      await renameModule([accountName, initialName, { newName: moduleName.trim() }]);
      toast.success("Grupo de projetos renomeado com sucesso.");
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
            <DialogTitle>{mode === "create" ? "Novo grupo de projetos" : "Editar grupo de projetos"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-2">
            {mode === "create" && (
              <FormSelect
                label="Conta"
                value={selectedAccount}
                onValueChange={setSelectedAccount}
                options={accountOptions}
                disabled={loading}
              />
            )}

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
        title={mode === "create" ? "Novo grupo de projetos" : "Editar grupo de projetos"}
        description={mode === "create"
          ? `Deseja realmente criar o grupo de projetos "${moduleName.trim()}" na conta "${selectedAccount}"?`
          : `Deseja renomear o grupo de projetos para "${moduleName.trim()}"?`}
        cancelText="Cancelar"
        confirmText={mode === "create" ? "Criar" : "Salvar"}
        type={mode === "create" ? "create" : "edit"}
      />
    </>
  );
}
