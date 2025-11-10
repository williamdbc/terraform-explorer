import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, FileCode } from 'lucide-react';
import { TERRAFORM_ACTIONS } from '@/constants/terraformActions';

interface ExecuteAllModalProps {
  open: boolean;
  projects: string[];
  accountName?: string;
  usedModuleName?: string;
  onClose: () => void;
  onExecute: (workingDirs: string[], command: string) => void;
}

export function ExecuteAllModal({ 
  open, 
  projects, 
  accountName,
  usedModuleName,
  onClose, 
  onExecute 
}: ExecuteAllModalProps) {
  const [custom, setCustom] = useState('');

  if (!open) return null;

  const run = (cmd: string) => {
    onExecute(projects, cmd);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">

        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Execute on All Projects</h3>
            <p className="text-sm text-slate-600 mt-1">
              Select a command to run on {projects.length} project{projects.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>


        <div className="p-6 space-y-6 overflow-auto flex-1">

          {(accountName || usedModuleName) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FileCode className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-900">Execution Context</p>
                  <div className="mt-2 space-y-1 text-sm text-blue-700">
                    {accountName && (
                      <p><span className="font-medium">Account:</span> {accountName}</p>
                    )}
                    {usedModuleName && (
                      <p><span className="font-medium">Used Module:</span> {usedModuleName}</p>
                    )}
                    <p><span className="font-medium">Projects:</span> {projects.length}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <Label className="text-sm font-semibold text-slate-900 mb-3 block">
              Terraform Commands
            </Label>
            <div className="grid grid-cols-4 gap-3">
              {TERRAFORM_ACTIONS.map((action) => (
                <Button
                  key={action.id}
                  onClick={() => run(action.command)}
                  className={`${action.className} w-full`}
                  size="default"
                >
                  <action.icon className="w-4 h-4 mr-2" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="custom-command" className="text-sm font-semibold text-slate-900 mb-2 block">
              Custom Command
            </Label>
            <Input
              id="custom-command"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="e.g. terraform plan -var 'x=1'"
              className="font-mono text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && custom.trim()) {
                  run(custom.trim());
                }
              }}
            />
          </div>

          <div>
            <Label className="text-sm font-semibold text-slate-900 mb-2 block">
              Affected Projects ({projects.length})
            </Label>
            <div className="max-h-48 overflow-auto border border-slate-200 rounded-lg">
              {projects.map((project, index) => (
                <div
                  key={project}
                  className={`px-3 py-2 text-sm font-mono text-slate-700 ${
                    index !== projects.length - 1 ? 'border-b border-slate-100' : ''
                  } hover:bg-slate-50 transition-colors`}
                >
                  {project}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
          <Button
            onClick={() => { if (custom.trim()) run(custom.trim()); }}
            disabled={!custom.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Run Custom Command
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
