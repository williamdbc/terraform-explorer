import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useServiceHook } from "@/hooks/useServiceHook";
import { FileService } from "@/services/FileService";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import type { FileWriteRequest } from "@/interfaces/requests/FileWriteRequest";

import { FileEditorContent } from "@/components/files/FileEditorContent";
import { FileEditorResizer } from "@/components/files/FileEditorResizer";
import { FileEditorStatusBar } from "@/components/files/FileEditorStatusBar";
import { FileEditorHeader } from "@/components/files/FileEditorHeader";
import { FileRenameDialog } from "@/components/files/FileRenameDialog";

interface FileEditorDialogProps {
  open: boolean;
  onClose: () => void;
  fileName: string;
  filePath: string;
  onSaveSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

export function FileEditorDialog({
  open,
  onClose,
  fileName: initialFileName,
  filePath,
  onSaveSuccess,
  onDeleteSuccess,
}: FileEditorDialogProps) {
  const [content, setContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [modified, setModified] = useState(false);
  const [modalHeight, setModalHeight] = useState<number>(() =>
    typeof window !== "undefined" ? Math.round(window.innerHeight * 0.8) : 600
  );
  const [caret, setCaret] = useState({ line: 1, column: 1 });
  const [fileSize, setFileSize] = useState(0);
  const [fileName, setFileName] = useState(initialFileName);

  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [showRenamedDialog, setShowRenamedDialog] = useState(false);

  const { execute: loadFile, loading: loadingFile } = useServiceHook(
    (path: string) => FileService.read(path)
  );

  const { execute: saveFile, loading: savingFile } = useServiceHook(
    (req: FileWriteRequest) => FileService.write(req)
  );

  const { execute: deleteFile, loading: deletingFile } = useServiceHook(
    (path: string) => FileService.delete(path)
  );

  useEffect(() => {
    if (open && filePath) {
      let mounted = true;
      (async () => {
        const res = await loadFile(filePath);
        if (!mounted) return;
        let text = res.content || "";
        if (text.startsWith('"') && text.endsWith('"')) text = text.slice(1, -1);
        text = text
          .replace(/\\n/g, "\n")
          .replace(/\\r/g, "\r")
          .replace(/\\t/g, "\t")
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, "\\");
        setContent(text);
        setOriginalContent(text);
        setModified(false);
      })();
      return () => {
        mounted = false;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Tab") return;
    e.preventDefault();
    const ta = e.currentTarget;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const value = ta.value;

    if (e.shiftKey) {
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const lineEnd = value.indexOf("\n", start);
      const endPos = lineEnd === -1 ? value.length : lineEnd;
      const line = value.slice(lineStart, endPos);
      let newLine = line;
      let removed = 0;
      if (line.startsWith("  ")) {
        newLine = line.slice(2);
        removed = 2;
      } else if (line.startsWith("\t")) {
        newLine = line.slice(1);
        removed = 1;
      } else if (line.startsWith(" ")) {
        newLine = line.slice(1);
        removed = 1;
      }
      if (removed > 0) {
        const newValue = value.slice(0, lineStart) + newLine + value.slice(endPos);
        setContent(newValue);
        setModified(true);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = Math.max(lineStart, start - removed);
        });
      }
    } else {
      const before = value.slice(0, start);
      const selected = value.slice(start, end);
      const after = value.slice(end);
      if (start === end) {
        const newValue = before + "  " + after;
        setContent(newValue);
        setModified(true);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + 2;
        });
      } else {
        const lines = selected.split("\n");
        const indented = lines.map(l => "  " + l).join("\n");
        const newValue = before + indented + after;
        setContent(newValue);
        setModified(true);
        requestAnimationFrame(() => {
          ta.selectionStart = start;
          ta.selectionEnd = start + indented.length;
        });
      }
    }
  };

  const openSaveConfirm = () => (!modified || savingFile ? null : setConfirmSaveOpen(true));

  const handleSaveConfirm = async () => {
    setConfirmSaveOpen(false);
    
    await saveFile({ path: filePath, content });
    setOriginalContent(content);
    setModified(false);
    toast.success(`"${fileName}" salvo com sucesso`);
    onSaveSuccess?.();
  };

  const openCloseConfirm = () => (modified ? setConfirmCloseOpen(true) : onClose());

  const handleCloseConfirm = () => {
    setConfirmCloseOpen(false);
    onClose();
  };

  const handleDelete = async () => {
    await deleteFile(filePath);
    toast.success(`"${fileName}" excluído`);
    onDeleteSuccess?.();
    onClose();
  };

  const handleRenameSuccess = (newName: string) => {
    setFileName(newName);
    toast.success(`Renomeado para "${newName}"`);
    onSaveSuccess?.();
    onClose();
  };

  if (!open) return null;

  const isBusy = loadingFile || savingFile || deletingFile;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div
          className="bg-slate-900 rounded-lg shadow-2xl w-full max-w-5xl flex flex-col overflow-hidden border border-slate-700"
          style={{ height: modalHeight }}
        >
          <FileEditorHeader
            fileName={fileName}
            modified={modified}
            isBusy={isBusy}
            onSave={openSaveConfirm}
            onRename={() => setShowRenamedDialog(true)}
            onDelete={() => setConfirmDeleteOpen(true)}
            onClose={openCloseConfirm}
          />

          <div className="flex-1 overflow-hidden">
            <FileEditorContent
              loading={loadingFile}
              content={content}
              disabled={isBusy}
              onContentChange={(v) => {
                setContent(v);
                setModified(v !== originalContent);
              }}
              onKeyDown={handleKeyDown}
              onCaretUpdate={updateCaret}
            />
          </div>

          <FileEditorResizer modalHeight={modalHeight} onHeightChange={setModalHeight} />

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
        title="Salvar alterações"
        description={`Deseja salvar as alterações no arquivo "${fileName}"?`}
        cancelText="Cancelar"
        confirmText="Salvar"
        type="edit"
      />

      <FileRenameDialog
        open={showRenamedDialog}
        onClose={() => setShowRenamedDialog(false)}
        oldPath={filePath}
        fileName={fileName}
        onRenameSuccess={handleRenameSuccess}
      />

      <ConfirmDialog
        open={confirmCloseOpen}
        onCancel={() => setConfirmCloseOpen(false)}
        onConfirm={handleCloseConfirm}
        title="Descartar alterações"
        description={`Há alterações não salvas em "${fileName}". Deseja descartá-las?`}
        cancelText="Cancelar"
        confirmText="Descartar"
        type="delete"
      />

      <ConfirmDialog
        open={confirmDeleteOpen}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Excluir arquivo"
        description={`Tem certeza que deseja excluir "${fileName}"? Esta ação não pode ser desfeita.`}
        cancelText="Cancelar"
        confirmText="Excluir"
        type="delete"
      />
    </>
  );
}
