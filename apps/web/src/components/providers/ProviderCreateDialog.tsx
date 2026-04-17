"use client";

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
import { ProvidersService } from "@/services/ProvidersService";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { FormInput } from "@/components/form/FormInput";
import type { AwsCredentialRequest } from "@/interfaces/requests/AwsCredentialRequest";
import { DialogFooterButtons } from "@/components/dialogs/DialogFooterButtons";

interface ProviderCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateSuccess?: () => void;
}

export function ProviderCreateDialog({
  open,
  onClose,
  onCreateSuccess,
}: ProviderCreateDialogProps) {
  const [formData, setFormData] = useState<AwsCredentialRequest>({
    profileName: "",
    accessKeyId: "",
    secretAccessKey: "",
    region: "",
  });
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { execute: createProvider, loading } = useServiceHook(
    (req: AwsCredentialRequest) => ProvidersService.createOrUpdateAwsProfile(req)
  );

  const handleChange = (field: keyof AwsCredentialRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.profileName.trim()) {
      toast.error("Nome do profile é obrigatório.");
      return;
    }

    if (!formData.accessKeyId.trim()) {
      toast.error("Access Key ID é obrigatório.");
      return;
    }

    if (!formData.secretAccessKey.trim()) {
      toast.error("Secret Access Key é obrigatório.");
      return;
    }

    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setConfirmOpen(false);

    await createProvider({
      profileName: formData.profileName.trim(),
      accessKeyId: formData.accessKeyId.trim(),
      secretAccessKey: formData.secretAccessKey.trim(),
      region: formData.region?.trim() || undefined,
    });
    toast.success("Provider criado com sucesso.");
    onCreateSuccess?.();
    onClose();
    setFormData({
      profileName: "",
      accessKeyId: "",
      secretAccessKey: "",
      region: "",
    });
  };

  if (!open) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo provider AWS</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-2">
            <FormInput
              id="profile-name-input"
              label="Profile Name"
              value={formData.profileName}
              onChange={(e) => handleChange("profileName", e.target.value)}
              placeholder="nome-do-profile"
              disabled={loading}
            />

            <FormInput
              id="access-key-input"
              label="Access Key ID"
              type="password"
              value={formData.accessKeyId}
              onChange={(e) => handleChange("accessKeyId", e.target.value)}
              placeholder="AKIAIOSFODNN7EXAMPLE"
              disabled={loading}
            />

            <FormInput
              id="secret-key-input"
              label="Secret Access Key"
              type="password"
              value={formData.secretAccessKey}
              onChange={(e) => handleChange("secretAccessKey", e.target.value)}
              placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
              disabled={loading}
            />

            <FormInput
              id="region-input"
              label="Region (opcional)"
              value={formData.region ?? ""}
              onChange={(e) => handleChange("region", e.target.value)}
              placeholder="us-east-1"
              disabled={loading}
            />

            <DialogFooterButtons
              loading={loading}
              onCancel={onClose}
              confirmText="Criar"
              type="create"
            />
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        title="Confirmar criação"
        description={`Deseja realmente criar o provider "${formData.profileName.trim()}"?`}
        cancelText="Cancelar"
        type="create"
        confirmText="Criar"
      />
    </>
  );
}
