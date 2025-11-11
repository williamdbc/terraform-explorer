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
import { ProjectService } from "@/services/ProjectService";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { FormInput } from "@/components/form/FormInput";
import { FormSelect } from "@/components/form/FormSelect";
import type { ProjectCopyRequest } from "@/interfaces/requests/ProjectCopyRequest";
import type { Account } from "@/interfaces/TerraformStructure";
import { DialogFooterButtons } from "@/components/dialogs/DialogFooterButtons";

interface ProjectCopyDialogProps {
  open: boolean;
  onClose: () => void;
  accountName: string;
  projectGroupName: string;
  projectName: string;
  accounts: Account[];
  onCopySuccess?: () => void;
}

export function ProjectCopyDialog({
  open,
  onClose,
  accountName,
  projectGroupName,
  projectName,
  accounts,
  onCopySuccess,
}: ProjectCopyDialogProps) {
  const initialFormData: ProjectCopyRequest = {
    source: { accountName, moduleName: projectGroupName, projectName },
    destination: { accountName, moduleName: projectGroupName, projectName: "" },
  };

  const [formData, setFormData] = useState<ProjectCopyRequest>(initialFormData);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { execute: copyProject, loading } = useServiceHook(
    (req: ProjectCopyRequest) => ProjectService.copyProject(req)
  );

  useEffect(() => {
    setFormData(initialFormData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountName, projectGroupName, projectName]);

  const updateSourceField = (field: keyof ProjectCopyRequest["source"], value: string) => {
    setFormData(prev => ({
      ...prev,
      source: { ...prev.source, [field]: value },
    }));
  };

  const updateDestinationField = (field: keyof ProjectCopyRequest["destination"], value: string) => {
    setFormData(prev => ({
      ...prev,
      destination: { ...prev.destination, [field]: value },
    }));
  };

  const handleDestAccountChange = (value: string) => {
    updateDestinationField("accountName", value);
    updateDestinationField("moduleName", "");
    updateDestinationField("projectName", "");
  };

  const handleDestModuleChange = (value: string) => {
    updateDestinationField("moduleName", value);
    updateDestinationField("projectName", "");
  };

  const handleSourceProjectChange = (value: string) => {
    updateSourceField("projectName", value);
  };

  const handleDestProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateDestinationField("projectName", e.target.value);
  };

  const validateForm = (): boolean => {
    if (!formData.destination.accountName.trim()) {
      toast.error("Conta destino é obrigatória");
      return false;
    }
    if (!formData.destination.moduleName.trim()) {
      toast.error("Grupo de projetos de destino é obrigatório");
      return false;
    }
    if (!formData.destination.projectName.trim()) {
      toast.error("Nome do projeto destino é obrigatório");
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

    await copyProject(formData);
    toast.success("Projeto copiado com sucesso");
    onCopySuccess?.();
    onClose();
    updateDestinationField("projectName", "");
  };

  const handleCancel = () => {
    setConfirmOpen(false);
  };

  const destinationAccountOptions = accounts.map(acc => ({ value: acc.name, label: acc.name }));
  const destinationProjectGroups =
    accounts.find(a => a.name === formData.destination.accountName)?.projectGroups ?? [];
  const destinationModuleOptions = destinationProjectGroups.map(mod => ({ value: mod.name, label: mod.name }));
  const sourceProjectOptions =
    accounts
      .find(a => a.name === formData.source.accountName)
      ?.projectGroups.find(m => m.name === formData.source.moduleName)
      ?.projects.map(p => ({ value: p.name, label: p.name })) ?? [];

  if (!open) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={o => !o && onClose()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Copiar projeto</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-2">
            <FormSelect
              label="Conta destino"
              value={formData.destination.accountName}
              onValueChange={handleDestAccountChange}
              options={destinationAccountOptions}
              placeholder="Selecione a conta"
              disabled={loading}
            />

            <FormSelect
              label="Grupo de projetos de destino"
              value={formData.destination.moduleName}
              onValueChange={handleDestModuleChange}
              options={destinationModuleOptions}
              placeholder="Selecione o módulo"
              disabled={loading || !formData.destination.accountName}
            />

            <FormSelect
              label="Projeto origem"
              value={formData.source.projectName}
              onValueChange={handleSourceProjectChange}
              options={sourceProjectOptions}
              placeholder="Selecione o projeto"
              disabled={loading}
            />

            <FormInput
              id="dest-project-name"
              label="Nome do projeto destino"
              value={formData.destination.projectName}
              onChange={handleDestProjectNameChange}
              placeholder="Nome para o novo projeto"
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
        description={`Deseja copiar o projeto "${formData.source.projectName}" para "${formData.destination.projectName}"?`}
        cancelText="Cancelar"
        confirmText="Copiar"
      />
    </>
  );
}
