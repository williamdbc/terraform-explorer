import { AlertTriangle, PlayCircle, Loader2, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TERRAFORM_ACTIONS } from '@/constants/terraformActions';
import { useState } from 'react';
import { BatchTerraformDialog } from '@/components/terraform/BatchTerraformDialog';

interface TerraformActionsProps {
  path: string;
  hasMainTf: boolean;
  executing: boolean;
  onExecute: (command: string, path: string) => Promise<void>;
}

export function TerraformActions({
  path,
  hasMainTf,
  executing,
  onExecute,
}: TerraformActionsProps) {
  const [customCommand, setCustomCommand] = useState('');
  const [batchOpen, setBatchOpen] = useState(false);

  const hasFiles = path.length > 0;

  const handleCustom = () => {
    if (customCommand.trim()) {
      onExecute(customCommand.trim(), path);
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-slate-900">Terraform Actions</h2>
          <p className="text-sm text-slate-600 mt-0.5 font-mono truncate">
            {path || 'Nenhum diretório selecionado'}
          </p>
        </div>

        {!hasMainTf && hasFiles && (
          <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">Não há main.tf</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mb-3">
        {TERRAFORM_ACTIONS.slice(0, 4).map((action) => (
          <Button
            key={action.id}
            onClick={() => onExecute(action.command, path)}
            disabled={executing}
            className={`${action.className} min-w-28`}
            size="default"
          >
            <action.icon className="w-4 h-4 mr-2" />
            {action.label}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-5">
        {TERRAFORM_ACTIONS.slice(4).map((action) => (
          <Button
            key={action.id}
            onClick={() => onExecute(action.command, path)}
            disabled={executing}
            className={`${action.className} min-w-28`}
            size="default"
          >
            <action.icon className="w-4 h-4 mr-2" />
            {action.label}
          </Button>
        ))}
      </div>

      <div className="border-t border-slate-200 pt-5">
        <Label htmlFor="custom-tf" className="text-sm font-semibold text-slate-900 mb-2 block">
          Comando Customizado
        </Label>

        <div className="flex items-center justify-between gap-4">

          <div className="flex items-center gap-2 flex-1 max-w-2xl">
            <Input
              id="custom-tf"
              value={customCommand}
              onChange={(e) => setCustomCommand(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleCustom()}
              placeholder="ex: plan -out=prod.tfplan"
              className="font-mono text-sm"
              disabled={!hasMainTf || executing}
            />
            <Button
              onClick={handleCustom}
              disabled={!hasMainTf || executing || !customCommand.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5"
            >
              {executing ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
            </Button>
          </div>

          <div className="flex-1" />

          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBatchOpen(true)}
              disabled={!hasMainTf || executing}
              className="flex items-center gap-2 border-slate-300 whitespace-nowrap"
            >
              <Command className="w-4 h-4" />
              Executar Sequência de Comandos
            </Button>
          </div>
        </div>
      </div>

      {executing && (
        <div className="flex items-center justify-center gap-2 text-blue-700 mt-6 pt-4 border-t border-slate-200">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700"></div>
          <span className="text-sm font-medium">Executando comando...</span>
        </div>
      )}

      <BatchTerraformDialog
        open={batchOpen}
        onOpenChange={setBatchOpen}
        path={path}
        hasMainTf={hasMainTf}
        executing={executing}
        onExecuteSingle={onExecute}
      />
    </div>
  );
}