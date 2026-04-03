import { useState } from "react";
import { toast } from "sonner";
import { GitService } from "@/services/GitService";
import { getErrorMessage } from "@/utils/apiHandlerError";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface GitCommitDialogProps {
  open: boolean;
  selectedFiles: string[];
  onClose: () => void;
  onSuccess: () => void;
}

export function GitCommitDialog({ open, selectedFiles, onClose, onSuccess }: GitCommitDialogProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCommit = async () => {
    setLoading(true);
    try {
      const files = selectedFiles.length > 0 ? selectedFiles : undefined;
      await GitService.commit(message.trim() || undefined, files);
      toast.success("Commit realizado com sucesso.");
      setMessage("");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error) ?? "Erro ao commitar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Commit</DialogTitle>
        </DialogHeader>

        <div className="py-2 space-y-3">
          {selectedFiles.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-1">
                {selectedFiles.length} arquivo{selectedFiles.length > 1 ? "s" : ""} selecionado{selectedFiles.length > 1 ? "s" : ""}
              </p>
              <ul className="bg-slate-900 rounded p-2 max-h-28 overflow-y-auto space-y-0.5">
                {selectedFiles.map((f) => (
                  <li key={f} className="text-xs font-mono text-gray-300 truncate">{f}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <label className="text-sm text-gray-400 mb-1 block">
              Mensagem (deixe em branco para gerar automaticamente)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="auto-commit: descreve as mudanças..."
              className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 text-sm resize-none h-20 focus:outline-none focus:border-gray-500"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleCommit} disabled={loading}>
            {loading ? "Commitando..." : "Commitar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
