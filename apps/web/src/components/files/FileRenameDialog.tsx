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
import { FileService } from "@/services/FileService";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { FormInput } from "@/components/form/FormInput";
import { DialogFooterButtons } from "@/components/dialogs/DialogFooterButtons";
import type { RenameFileRequest } from "@/interfaces/requests/RenameFileRequest";

interface FileRenameDialogProps {
  open: boolean;
  onClose: () => void;
  oldPath: string;
  fileName: string;
  onRenameSuccess: (newPath: string, newName: string) => void;
}

export function FileRenameDialog({
  open,
  onClose,
  oldPath,
  fileName,
  onRenameSuccess,
}: FileRenameDialogProps) {
  const [newFileName, setNewFileName] = useState(fileName);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { execute: renameFile, loading: renaming } = useServiceHook(
    (req: RenameFileRequest) => FileService.rename(req)
  );

  useEffect(() => {
    if (open) setNewFileName(fileName);
  }, [open, fileName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newFileName.trim();

    if (!trimmed) {
      toast.error("Nome do arquivo é obrigatório.");
      return;
    }

    if (trimmed === fileName) {
      toast("Nenhuma alteração no nome.");
      return;
    }

    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setConfirmOpen(false);

    const dir = oldPath.substring(0, oldPath.lastIndexOf("/"));
    const newPath = dir ? `${dir}/${newFileName.trim()}` : newFileName.trim();

    await renameFile({ oldPath, newPath });
    toast.success(`Arquivo renomeado para "${newFileName.trim()}".`);
    onRenameSuccess(newPath, newFileName.trim());
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Renomear Arquivo</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-2">
            <FormInput
              id="file-name-input"
              label="Novo nome"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="novo-nome.tf"
              disabled={renaming}
            />

            <DialogFooterButtons
              loading={renaming}
              onCancel={onClose}
              confirmText="Renomear"
              type="edit"
            />
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        title="Renomear arquivo"
        description={`Deseja renomear "${fileName}" para "${newFileName.trim()}"?`}
        cancelText="Cancelar"
        confirmText="Renomear"
        type="edit"
      />
    </>
  );
}