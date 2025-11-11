import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TERRAFORM_ACTIONS } from '@/constants/terraformActions';

interface TerraformActionsProps {
  path: string;
  hasMainTf: boolean;
  executing: boolean;
  onExecute: (command: string, path: string) => void;
}

export function TerraformActions({ 
  path, 
  hasMainTf, 
  executing, 
  onExecute 
}: TerraformActionsProps) {
  const hasFiles = path.length > 0;

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-slate-900">Terraform Actions</h2>
          <p className="text-sm text-slate-600 mt-0.5 font-mono truncate">
            {path}
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
            disabled={!hasMainTf || executing}
            className={`${action.className} min-w-28`}
            size="default"
          >
            <action.icon className="w-4 h-4 mr-2" />
            {action.label}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {TERRAFORM_ACTIONS.slice(4, 8).map((action) => (
          <Button
            key={action.id}
            onClick={() => onExecute(action.command, path)}
            disabled={!hasMainTf || executing}
            className={`${action.className} min-w-28`}
            size="default"
          >
            <action.icon className="w-4 h-4 mr-2" />
            {action.label}
          </Button>
        ))}
      </div>

      {executing && (
        <div className="flex items-center justify-center gap-2 text-blue-700 mt-4 pt-3 border-t border-slate-200">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700"></div>
          <span className="text-sm font-medium">Executando comando..</span>
        </div>
      )}
    </div>
  );
}