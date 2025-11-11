"use client";

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
import { FormInput } from "@/components/form/FormInput";
import { DialogFooterButtons } from "@/components/dialogs/DialogFooterButtons";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";

interface ProjectRenameDialogProps {
  open: boolean;
  onClose: () => void;
  accountName: string;
  projectGroupName: string;
  projectName: string;
  onRenameSuccess?: (newName: string) => void;
}

export function ProjectRenameDialog({
  open,
  onClose,
  accountName,
  projectGroupName,
  projectName,
  onRenameSuccess,
}: ProjectRenameDialogProps) {
  const [newName, setNewName] = useState(projectName);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { execute: renameProject, loading } = useServiceHook(
    (newProjectName: string) =>
      ProjectService.rename(accountName, projectGroupName, projectName, newProjectName)
  );

  useEffect(() => {
    if (open) {
      setNewName(projectName);
    }
  }, [open, projectName]);

  const validateForm = (): boolean => {
    if (newName.trim() === projectName) {
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
  
  await renameProject(newName.trim());
  toast.success(`Projeto renomeado para "${newName.trim()}"`);
  onRenameSuccess?.(newName.trim());
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
            <DialogTitle>Renomear Projeto</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-2">
            <FormInput
              id="new-project-name"
              label="Novo nome do projeto"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="nome-do-projeto"
              disabled={loading}
            />

            <DialogFooterButtons
              loading={loading}
              onCancel={onClose}
              confirmText="Salvar"
              type="edit"
            />
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        title="Confirmar renomeação"
        description={`Deseja renomear o projeto para "${newName.trim()}"?`}
        cancelText="Cancelar"
        confirmText="Salvar"
        type="edit"
      />
    </>
  );
}
