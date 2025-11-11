import * as React from "react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useServiceHook } from "@/hooks/useServiceHook";
import { AccountService } from "@/services/AccountService";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { FormInput } from "@/components/form/FormInput";
import type { CreateItemRequest } from "@/interfaces/requests/CreateItemRequest";
import type { RenameRequest } from "@/interfaces/requests/RenameRequest";
import { DialogFooterButtons } from "@/components/dialogs/DialogFooterButtons";

interface AccountCreateEditDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  initialName?: string;
  onCreateSuccess?: () => void;
  onEditSuccess?: () => void;
}

export function AccountCreateEditDialog({
  open,
  onClose,
  mode,
  initialName = "",
  onCreateSuccess,
  onEditSuccess,
}: AccountCreateEditDialogProps) {
  const initialAccountName = mode === "create" ? "" : initialName;

  const [accountName, setAccountName] = useState(initialAccountName)
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { execute: createAccount, loading: loadingCreate } = useServiceHook(
    (req: CreateItemRequest) => AccountService.create(req)
  );
  const { execute: renameAccount, loading: loadingRename } = useServiceHook(
    ([oldName, renameReq]: [string, RenameRequest]) => AccountService.rename(oldName, renameReq)
  );

  useEffect(() => {
    setAccountName(initialAccountName);
  }, [initialAccountName]);


  const loading = mode === "create" ? loadingCreate : loadingRename;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccountName(e.target.value);
  };

  const validateForm = (): boolean => {
    if (!accountName.trim()) {
      toast.error("Nome da conta é obrigatório");
      return false;
    }

    if (mode === "edit" && accountName.trim() === initialName) {
      toast("Nenhuma alteração feita no nome");
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
      await createAccount({ name: accountName.trim() });
      toast.success("Conta criada com sucesso");
      onCreateSuccess?.();
    } else {
      await renameAccount([initialName, { newName: accountName.trim() }]);
      toast.success("Conta renomeada com sucesso");
      onEditSuccess?.();
    }
    
    onClose();
    setAccountName("");
  };

  const handleCancel = () => {
    setConfirmOpen(false);
  };

  if (!open) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "Nova conta" : "Editar conta"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-2">
            <FormInput
              id="account-name-input"
              label="Nome da conta"
              value={accountName}
              onChange={handleNameChange}
              placeholder="nome-da-conta"
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
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        title={mode === "create" ? "Nova conta" : "Editar conta"}
        description={
          mode === "create"
            ? `Deseja realmente criar a conta "${accountName.trim()}"?`
            : `Deseja renomear a conta para "${accountName.trim()}"?`
        }
        cancelText="Cancelar"
        confirmText={mode === "create" ? "Criar" : "Salvar"}
        type={mode === "create" ? "create" : "edit"}
      />
    </>
  );
}