import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Play, Terminal } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface BatchTerraformDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  path: string;
  hasMainTf: boolean;
  executing: boolean;
  onExecute: (command: string, path: string) => Promise<void>;
}

export function BatchTerraformDialog({
  open,
  onOpenChange,
  path,
  hasMainTf,
  executing,
  onExecute,
}: BatchTerraformDialogProps) {
  const [commandsText, setCommandsText] = useState("");

  const commands = commandsText
    .split("\n")
    .map((cmd) => cmd.trim())
    .filter((cmd) => cmd.length > 0 && !cmd.startsWith("#"));

  const handleRunAll = async () => {
    if (commands.length === 0) {
      toast.error("Nenhum comando válido para executar");
      return;
    }

    toast.info(`Iniciando execução de ${commands.length} comando(s) em lote...`);

    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];
      toast.info(`(${i + 1}/${commands.length}) terraform ${cmd}`);
      await onExecute(cmd, path);
      toast.success(`Concluído: terraform ${cmd}`);
    }

    toast.success("Todos os comandos foram executados com sucesso!");
    onOpenChange(false);
    setCommandsText("");
  };

  const isDisabled = !hasMainTf || executing || commands.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            Executar Comandos em Lote
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="batch-commands" className="text-sm font-semibold">
              Comandos Terraform (um por linha)
            </Label>
            <Textarea
              id="batch-commands"
              value={commandsText}
              onChange={(e) => setCommandsText(e.target.value)}
              placeholder={`init \nplan\napply\ndestroy\n# linha comentada é ignorada`}
              className="font-mono text-sm mt-2 h-64 resize-none"
              disabled={executing}
            />
            <p className="text-xs text-slate-500 mt-2">
              Linhas vazias e comentários com <code className="bg-slate-100 px-1 rounded">#</code> são ignorados.
            </p>
          </div>

          {commands.length > 0 && !executing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900">
                {commands.length} comando(s) serão executados:
              </p>
              <ul className="mt-2 space-y-1 text-sm font-mono text-blue-800">
                {commands.map((cmd, i) => (
                  <li key={i}>
                    {i + 1}. <code>terraform {cmd}</code>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={executing}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleRunAll}
            disabled={isDisabled}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {executing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Executando... ({commands.length})
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Executar Todos ({commands.length})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}