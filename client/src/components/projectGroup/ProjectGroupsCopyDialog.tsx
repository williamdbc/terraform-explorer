import * as React from "react";
import { useState, useEffect, useMemo } from "react";
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
import type { ProjectGroupCopyRequest } from "@/interfaces/requests/ProjectGroupCopyRequest";
import type { Account } from "@/interfaces/TerraformStructure";
import { DialogFooterButtons } from "@/components/dialogs/DialogFooterButtons";

interface ProjectGroupCopyDialogProps {
  open: boolean;
  onClose: () => void;
  accounts: Account[];
  accountName: string;
  usedModuleName: string;
  onCopySuccess?: () => void;
}

export function ProjectGroupCopyDialog({
  open,
  onClose,
  accounts,
  accountName,
  usedModuleName,
  onCopySuccess,
}: ProjectGroupCopyDialogProps) {
  const initialFormData: ProjectGroupCopyRequest = {
    source: { accountName, groupName: usedModuleName },
    destination: { accountName, groupName: "" },
  };

  const [formData, setFormData] = useState<ProjectGroupCopyRequest>(initialFormData);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { execute: copyUsedModule, loading } = useServiceHook(
    (req: ProjectGroupCopyRequest) => ProjectGroupService.copyProjectGroup(req)
  );

  const accountOptions = useMemo(
    () => accounts.map((acc) => ({ value: acc.name, label: acc.name })),
    [accounts]
  );

  const sourceModuleOptions = useMemo(() => {
    const sourceAccount = accounts.find((a) => a.name === formData.source.accountName);
    return sourceAccount?.projectGroups.map((m) => ({ value: m.name, label: m.name })) ?? [];
  }, [accounts, formData.source.accountName]);

  useEffect(() => {
    if (accounts.length > 0) {
      setFormData(initialFormData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts, accountName, usedModuleName]);

  const updateSourceField = (field: keyof ProjectGroupCopyRequest["source"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      source: { ...prev.source, [field]: value },
    }));
  };

  const updateDestinationField = (
    field: keyof ProjectGroupCopyRequest["destination"],
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      destination: { ...prev.destination, [field]: value },
    }));
  };

  const handleSourceAccountChange = (value: string) => {
    const acc = accounts.find((a) => a.name === value);
    const firstModule = acc?.projectGroups?.[0]?.name ?? "";
    updateSourceField("accountName", value);
    updateSourceField("groupName", firstModule);
  };

  const handleSourceModuleChange = (value: string) => {
    updateSourceField("groupName", value);
  };

  const handleDestAccountChange = (value: string) => {
    updateDestinationField("accountName", value);
    updateDestinationField("groupName", "");
  };

  const handleDestModuleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateDestinationField("groupName", e.target.value);
  };

  const validateForm = (): boolean => {
    const d = formData.destination;
    if (!d.accountName.trim()) {
      toast.error("Conta destino é obrigatória.");
      return false;
    }
    if (!d.groupName.trim()) {
      toast.error("Nome do grupo de projetos de destino é obrigatório.");
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

    await copyUsedModule(formData);
    toast.success("Grupo de projetos copiado com sucesso.");
    onCopySuccess?.();
    onClose();
    updateDestinationField("groupName", "");
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
            <DialogTitle>Copiar grupo de projetos</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-2">
            <FormSelect
              label="Conta de origem"
              value={formData.source.accountName}
              onValueChange={handleSourceAccountChange}
              options={accountOptions}
              disabled={loading}
            />

            <FormSelect
              label="Grupo de projetos de origem"
              value={formData.source.groupName}
              onValueChange={handleSourceModuleChange}
              options={sourceModuleOptions}
              disabled={loading || !formData.source.accountName}
            />

            <FormSelect
              label="Conta de destino"
              value={formData.destination.accountName}
              onValueChange={handleDestAccountChange}
              options={accountOptions}
              disabled={loading}
            />

            <FormInput
              id="module-name-dest"
              label="Nome do gruoo de projetos de destino"
              value={formData.destination.groupName}
              onChange={handleDestModuleNameChange}
              placeholder="nome-do-grupo-projetos"
              disabled={loading}
            />

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
        description={`Deseja copiar o grupo de projetos "${formData.source.groupName}" da conta "${formData.source.accountName}" para "${formData.destination.groupName}" na conta "${formData.destination.accountName}"?`}
        cancelText="Cancelar"
        confirmText="Copiar"
      />
    </>
  );
}
