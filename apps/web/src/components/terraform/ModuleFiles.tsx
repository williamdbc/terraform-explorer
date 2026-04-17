import type { TerraformFile } from '@/interfaces/TerraformStructure';
import { FileCode, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ModuleFilesProps {
  files: TerraformFile[];
  onFileSelect: (fileName: string, filePath: string) => void;
  onCreateFile: () => void;
}

export function ModuleFiles({ 
  files, 
  onFileSelect, 
  onCreateFile 
}: ModuleFilesProps) {
  return (
    <div className="bg-white border-b border-slate-200">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900">Arquivos</h3>
          <Button
            onClick={onCreateFile}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo arquivo
          </Button>
        </div>

        {files.length === 0 ? (
          <p className="text-sm text-slate-500">Não há arquivos</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {files.map((file) => (
              <button
                key={file.path}
                onClick={() => onFileSelect(file.name, file.path)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors text-left group"
              >
                <FileCode className="w-4 h-4 text-blue-600 group-hover:text-blue-700 transition-colors" />
                <span className="text-sm font-medium text-slate-700 truncate group-hover:text-slate-900">
                  {file.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
