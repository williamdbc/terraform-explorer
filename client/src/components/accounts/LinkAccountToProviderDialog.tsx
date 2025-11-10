import * as React from "react";
import { useState, useMemo } from "react";
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
import { FormSelect } from "@/components/form/FormSelect";
import type { SetAwsConfigRequest } from "@/interfaces/requests/SetAwsConfigRequest";
import type { Provider } from "@/interfaces/TerraformStructure";
import { DialogFooterButtons } from "@/components/dialogs/DialogFooterButtons";

interface LinkAccountToProviderDialogProps {
  open: boolean;
  onClose: () => void;
  accountName: string;
  providers: Provider[];
  onLinkSuccess?: () => void;
}

export function LinkAccountToProviderDialog({
  open,
  onClose,
  accountName,
  providers,
  onLinkSuccess,
}: LinkAccountToProviderDialogProps) {
  const initialFormData: SetAwsConfigRequest = {
    profile: "",
    roleArn: "",
    region: "",
  };

  const [formData, setFormData] = useState<SetAwsConfigRequest>(initialFormData);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { execute: linkProvider, loading } = useServiceHook(
    ([accName, req]: [string, SetAwsConfigRequest]) =>
      AccountService.linkProviderToAccount(accName, req)
  );

  const providerOptions = useMemo(() => {
    return providers.map((p) => ({ value: p.name, label: p.name }));
  }, [providers]);

  const updateField = (field: keyof SetAwsConfigRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileChange = (value: string) => {
    updateField("profile", value);
  };

  const handleRoleArnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateField("roleArn", e.target.value);
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateField("region", e.target.value);
  };

  const validateForm = (): boolean => {
    if (!formData.profile.trim()) {
      toast.error("Profile é obrigatório");
      return false;
    }
    if (!formData.region.trim()) {
      toast.error("Region é obrigatório");
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

    await linkProvider([
      accountName,
      {
        profile: formData.profile.trim(),
        roleArn: formData.roleArn?.trim() || undefined,
        region: formData.region.trim(),
      },
    ]);

    toast.success(`Provider linkado à conta "${accountName}" com sucesso`);
    onLinkSuccess?.();
    onClose();
    setFormData(initialFormData);
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
            <DialogTitle>Linkar Provider à Conta: {accountName}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-2">
            <FormSelect
              label="Profile AWS"
              value={formData.profile}
              onValueChange={handleProfileChange}
              options={providerOptions}
              disabled={loading || providers.length === 0}
              placeholder="Selecione o profile"
            />

            <FormInput
              id="role-arn-input"
              label="Assume Role ARN (opcional)"
              value={formData.roleArn ?? ""}
              onChange={handleRoleArnChange}
              placeholder="arn:aws:iam::123456789012:role/MyRole"
              disabled={loading}
            />

            <FormInput
              id="region-input"
              label="Region"
              value={formData.region}
              onChange={handleRegionChange}
              placeholder="us-east-1"
              disabled={loading}
            />

            <DialogFooterButtons
              loading={loading}
              onCancel={onClose}
              confirmText="Linkar"
            />
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        title="Confirmar linkagem"
        description={`Deseja linkar o provider "${formData.profile}" à conta "${accountName}"?`}
        cancelText="Cancelar"
        confirmText="Linkar"
        type="default"
      />
    </>
  );
}