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
import type { CreateProjectRequest } from "@/interfaces/requests/CreateProjectRequest";
import type { Account, TerraformModule } from "@/interfaces/TerraformStructure";
import { DialogFooterButtons } from "@/components/dialogs/DialogFooterButtons";

interface ProjectCreateDialogProps {
  open: boolean;
  onClose: () => void;
  accountName: string;
  projectGroupName: string;
  accounts: Account[];
  modules: TerraformModule[];
  onCreateSuccess?: () => void;
}

export function ProjectCreateDialog({
  open,
  onClose,
  accountName,
  projectGroupName,
  accounts,
  modules,
  onCreateSuccess,
}: ProjectCreateDialogProps) {
  const initialFormData: CreateProjectRequest = {
    accountName,
    projectGroupName,
    moduleName: "",
    projectName: "",
  };

  const [formData, setFormData] = useState<CreateProjectRequest>(initialFormData);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { execute: createProject, loading } = useServiceHook(
    (req: CreateProjectRequest) => ProjectService.create(req)
  );

  useEffect(() => {
    setFormData(initialFormData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountName, projectGroupName]);

  const accountOptions = accounts.map(acc => ({ value: acc.name, label: acc.name }));

  const projectGroupOptions = (() => {
    const account = accounts.find(acc => acc.name === formData.accountName);
    return account?.projectGroups.map(mod => ({ value: mod.name, label: mod.name })) ?? [];
  })();

  const moduleOptions = modules.map(mod => ({ value: mod.name, label: mod.name }));

  const updateField = (field: keyof CreateProjectRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAccountChange = (value: string) => {
    updateField("accountName", value);
    updateField("projectGroupName", "");
  };

  const handleProjectGroupChange = (value: string) => {
    updateField("projectGroupName", value);
  };

  const handleModuleChange = (value: string) => {
    updateField("moduleName", value);
  };

  const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateField("projectName", e.target.value);
  };

  const validateForm = (): boolean => {
    if (!formData.accountName.trim()) {
      toast.error("Conta é obrigatória");
      return false;
    }
    if (!formData.projectGroupName.trim()) {
      toast.error("Grupo de projetos é obrigatório");
      return false;
    }
    if (!formData.moduleName.trim()) {
      toast.error("Módulo é obrigatório");
      return false;
    }
    if (!formData.projectName.trim()) {
      toast.error("Nome do projeto é obrigatório");
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

    await createProject({
      accountName: formData.accountName.trim(),
      projectGroupName: formData.projectGroupName.trim(),
      moduleName: formData.moduleName.trim(),
      projectName: formData.projectName.trim(),
    });
    toast.success("Projeto criado com sucesso");
    onCreateSuccess?.();
    onClose();
    setFormData(initialFormData);
  };

  const handleCancel = () => {
    setConfirmOpen(false);
  };

  if (!open) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={o => !o && onClose()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo projeto</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-2">
            <FormSelect
              label="Conta"
              value={formData.accountName}
              onValueChange={handleAccountChange}
              options={accountOptions}
              disabled={loading}
            />

            <FormSelect
              label="Grupo de projetos"
              value={formData.projectGroupName}
              onValueChange={handleProjectGroupChange}
              options={projectGroupOptions}
              disabled={loading || !formData.accountName}
            />

            <FormSelect
              label="Módulo (origem)"
              value={formData.moduleName}
              onValueChange={handleModuleChange}
              options={moduleOptions}
              disabled={loading}
            />

            <FormInput
              id="project-name-input"
              label="Nome do projeto"
              value={formData.projectName}
              onChange={handleProjectNameChange}
              placeholder="nome-do-projeto"
              disabled={loading}
            />

            <DialogFooterButtons
              loading={loading}
              onCancel={onClose}
              confirmText="Criar"
              confirmClassName="bg-green-600 hover:bg-green-700 text-white"
              type="create"
            />
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        title="Confirmar criação"
        description={`Deseja criar o projeto "${formData.projectName.trim()}" na conta "${formData.accountName}" usando o módulo "${formData.moduleName}"?`}
        cancelText="Cancelar"
        confirmText="Criar"
        type="create"
      />
    </>
  );
}