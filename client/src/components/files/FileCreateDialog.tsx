import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useServiceHook } from "@/hooks/useServiceHook";
import { FileService } from "@/services/FileService";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import type { FileWriteRequest } from "@/interfaces/requests/FileWriteRequest";

import { FileCreateHeader } from "./FileCreateHeader";
import { FileCreateNameInput } from "./FileCreateNameInput";
import { FileEditorContent } from "@/components/files/FileEditorContent";
import { FileEditorStatusBar } from "@/components/files/FileEditorStatusBar";

interface FileCreateDialogProps {
  open: boolean;
  onClose: () => void;
  initialPath?: string;
  onCreateSuccess?: () => void;
}

export function FileCreateDialog({
  open,
  onClose,
  initialPath = "",
  onCreateSuccess,
}: FileCreateDialogProps) {
  const [fileName, setFileName] = useState("");
  const [content, setContent] = useState("");
  const [modified, setModified] = useState(false);
  const [caret, setCaret] = useState({ line: 1, column: 1 });
  const [fileSize, setFileSize] = useState(0);

  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);

  const fullPath = initialPath ? `${initialPath}/${fileName}`.replace(/\/+/g, "/") : fileName;

  const { execute: createFile, loading: creating } = useServiceHook(
    (req: FileWriteRequest) => FileService.write(req)
  );

  useEffect(() => {
    if (open) {
      setFileName("");
      setContent("");
      setModified(false);
      setCaret({ line: 1, column: 1 });
    }
  }, [open]);

  useEffect(() => {
    try {
      setFileSize(new Blob([content]).size);
    } catch {
      setFileSize(content.length);
    }
  }, [content]);

  const updateCaret = () => {
    const ta = document.querySelector("textarea");
    if (!ta) return;
    const pos = ta.selectionStart;
    const before = ta.value.slice(0, pos);
    const lines = before.split("\n");
    setCaret({ line: lines.length, column: lines[lines.length - 1].length + 1 });
  };

  const openSaveConfirm = () => {
    const trimmed = fileName.trim();
    if (!trimmed) return toast.error("Nome do arquivo é obrigatório");
    if (!trimmed.match(/^[a-zA-Z0-9._-]+$/))
      return toast.error("Nome inválido (use apenas letras, números, _, -, .)");
    setConfirmSaveOpen(true);
  };

  const handleSaveConfirm = async () => {
    setConfirmSaveOpen(false);
    
    await createFile({ path: fullPath, content });
    toast.success(`"${fileName}" criado com sucesso`);
    onCreateSuccess?.();
    onClose();
  };

  const openCloseConfirm = () => {
    if (!modified && content === "") {
      onClose();
      return;
    }
    setConfirmCloseOpen(true);
  };

  const handleCloseConfirm = () => {
    setConfirmCloseOpen(false);
    onClose();
  };

  if (!open) return null;

  const isBusy = creating;
  const canSave = fileName.trim() !== "";

  return (
    <>
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 rounded-lg shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden border border-slate-700">
          <FileCreateHeader
            isBusy={isBusy}
            canSave={canSave}
            onSave={openSaveConfirm}
            onClose={openCloseConfirm}
          />

          <FileCreateNameInput
            fileName={fileName}
            initialPath={initialPath}
            disabled={isBusy}
            onChange={(v) => {
              setFileName(v);
              setModified(true);
            }}
          />

          <div className="flex-1 overflow-hidden">
            <FileEditorContent
              loading={false}
              content={content}
              disabled={isBusy}
              onContentChange={(v) => {
                setContent(v);
                setModified(v !== "");
              }}
              onKeyDown={() => { }}
              onCaretUpdate={updateCaret}
            />
          </div>

          <FileEditorStatusBar
            caret={caret}
            charCount={content.length}
            byteSize={fileSize}
            modified={modified}
          />
        </div>
      </div>

      <ConfirmDialog
        open={confirmSaveOpen}
        onCancel={() => setConfirmSaveOpen(false)}
        onConfirm={handleSaveConfirm}
        title="Criar arquivo"
        description={`Criar "${fullPath}"?`}
        cancelText="Cancelar"
        confirmText="Criar"
        type="create"
      />

      <ConfirmDialog
        open={confirmCloseOpen}
        onCancel={() => setConfirmCloseOpen(false)}
        onConfirm={handleCloseConfirm}
        title="Descartar alterações"
        description="Há conteúdo não salvo. Deseja descartar?"
        cancelText="Cancelar"
        confirmText="Descartar"
        type="delete"
      />
    </>
  );
}
