import * as React from "react";
import { useState } from "react";
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
import type { AccountCopyRequest } from "@/interfaces/requests/AccountCopyRequest";
import type { Account } from "@/interfaces/TerraformStructure";
import { FormSelect } from "@/components/form/FormSelect";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooterButtons } from "@/components/dialogs/DialogFooterButtons";

interface AccountCopyDialogProps {
  open: boolean;
  onClose: () => void;
  accounts: Account[];
  onCopySuccess?: () => void;
}

export function AccountCopyDialog({
  open,
  onClose,
  accounts,
  onCopySuccess,
}: AccountCopyDialogProps) {
  const initialFormData: AccountCopyRequest = {
    sourceAccountName: accounts[0]?.name ?? "",
    destinationAccountName: "",
    copyProjectGroups: true,
  };

  const [formData, setFormData] = useState<AccountCopyRequest>(initialFormData);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { execute: copyAccount, loading } = useServiceHook(
    (req: AccountCopyRequest) => AccountService.copyAccount(req)
  );

  const accountOptions = accounts.map((acc) => ({ value: acc.name, label: acc.name }));

  const updateField = <K extends keyof AccountCopyRequest>(
    field: K,
    value: AccountCopyRequest[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSourceAccountChange = (value: string) => {
    updateField("sourceAccountName", value);
  };

  const handleDestAccountNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateField("destinationAccountName", e.target.value);
  };

  const handleCopyProjectGroupChange = (checked: boolean) => {
    updateField("copyProjectGroups", checked);
  };

  const validateForm = (): boolean => {
    if (!formData.sourceAccountName.trim()) {
      toast.error("Conta de origem é obrigatória");
      return false;
    }
    if (!formData.destinationAccountName.trim()) {
      toast.error("Nome da nova conta é obrigatório");
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
    
    await copyAccount(formData);
    toast.success(`Conta "${formData.sourceAccountName}" copiada para "${formData.destinationAccountName}"`);
    onCopySuccess?.();
    updateField("destinationAccountName", "");
    onClose();
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
            <DialogTitle>Copiar Conta</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-2">
            <FormSelect
              label="Conta de Origem"
              value={formData.sourceAccountName}
              onValueChange={handleSourceAccountChange}
              options={accountOptions}
              disabled={loading}
            />

            <FormInput
              id="dest-account-name"
              label="Nome da Nova Conta"
              value={formData.destinationAccountName}
              onChange={handleDestAccountNameChange}
              placeholder="nome-da-nova-conta"
              disabled={loading}
            />

            <div className="flex items-center space-x-2">
              <Checkbox
                id="copyProjectGorup"
                checked={formData.copyProjectGroups}
                onCheckedChange={handleCopyProjectGroupChange}
                disabled={loading}
              />
              <label htmlFor="copyProjectGorup" className="text-sm text-slate-700 select-none">
                Copiar Used Modules também
              </label>
            </div>

            <DialogFooterButtons
              loading={loading}
              onCancel={onClose}
              confirmText="Copiar"
            />
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        title="Confirmar cópia"
        description={`Deseja copiar a conta "${formData.sourceAccountName}" para "${formData.destinationAccountName}"?`}
        cancelText="Cancelar"
        confirmText="Copiar"
        type="create"
      />
    </>
  );
}
