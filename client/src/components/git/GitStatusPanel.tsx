import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FaCodeBranch, FaArrowUp, FaArrowDown, FaGithub } from "react-icons/fa";
import { GitService } from "@/services/GitService";
import { getErrorMessage } from "@/utils/apiHandlerError";
import type { GitFileChange, GitStatusResponse } from "@/interfaces/responses/GitStatusResponse";

const STATUS_CONFIG: Record<string, { symbol: string; color: string; label: string }> = {
  A: { symbol: "+", color: "text-green-400",  label: "Adicionado" },
  "?": { symbol: "+", color: "text-green-400", label: "Novo arquivo" },
  M: { symbol: "~", color: "text-yellow-400", label: "Modificado" },
  D: { symbol: "-", color: "text-red-400",    label: "Deletado" },
  R: { symbol: "→", color: "text-blue-400",   label: "Renomeado" },
};

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
        checked ? "bg-blue-500 border-blue-500" : "border-gray-500"
      }`}
    >
      {checked && (
        <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 text-white fill-current">
          <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}

function FileStatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { symbol: "?", color: "text-gray-400", label: status };
  return (
    <span
      className={`shrink-0 w-4 text-center font-mono font-bold text-xs ${cfg.color}`}
      title={cfg.label}
    >
      {cfg.symbol}
    </span>
  );
}

const INTERVAL_OPTIONS = [
  { label: "30s", value: 30 },
  { label: "1min", value: 60 },
  { label: "5min", value: 300 },
  { label: "10min", value: 600 },
];

interface GitStatusPanelProps {
  status: GitStatusResponse | null;
  loadingPush: boolean;
  loadingPull: boolean;
  onRefresh: () => void;
  onCommitRequest: (files: string[]) => void;
  onPushRequest: () => void;
  onPullRequest: () => void;
}

export function GitStatusPanel({
  status,
  loadingPush,
  loadingPull,
  onRefresh,
  onCommitRequest,
  onPushRequest,
  onPullRequest,
}: GitStatusPanelProps) {
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [loadingClone, setLoadingClone] = useState(false);

  const allFiles: GitFileChange[] = status?.changedFiles ?? [];
  const isReady = status?.isInitialized ?? false;
  const allSelected = allFiles.length > 0 && selectedPaths.size === allFiles.length;

  // Sync selection when file list changes — select all by default
  useEffect(() => {
    setSelectedPaths(new Set(allFiles.map((f) => f.path)));
  }, [allFiles.map((f) => f.path).join(",")]);

  const toggleFile = (path: string) => {
    setSelectedPaths((prev) => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedPaths(allSelected ? new Set() : new Set(allFiles.map((f) => f.path)));
  };

  const handleClone = async () => {
    setLoadingClone(true);
    try {
      await GitService.clone();
      toast.success("Repositório clonado com sucesso.");
      onRefresh();
    } catch (error) {
      toast.error(getErrorMessage(error) ?? "Erro ao clonar repositório.");
    } finally {
      setLoadingClone(false);
    }
  };

  const handleAutoCommitToggle = async () => {
    if (!status) return;
    try {
      await GitService.setAutoCommit(!status.autoCommitEnabled, status.autoCommitIntervalSeconds);
      toast.success(`Auto-commit ${!status.autoCommitEnabled ? "ativado" : "desativado"}.`);
      onRefresh();
    } catch (error) {
      toast.error(getErrorMessage(error) ?? "Erro ao atualizar auto-commit.");
    }
  };

  const handleIntervalChange = async (intervalSeconds: number) => {
    if (!status) return;
    try {
      await GitService.setAutoCommit(status.autoCommitEnabled, intervalSeconds);
      onRefresh();
    } catch (error) {
      toast.error(getErrorMessage(error) ?? "Erro ao atualizar intervalo.");
    }
  };

  const selectedCount = selectedPaths.size;

  return (
    <>
      <div className="absolute right-0 top-full mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 text-sm">

        {/* Branch status / no-repo state */}
        <div className="px-4 py-3 border-b border-slate-700">
          {!isReady ? (
            <div className="flex flex-col items-center gap-3 py-2">
              <FaGithub className="w-8 h-8 text-gray-500" />
              <p className="text-gray-400 text-xs text-center leading-relaxed">
                Nenhum repositório encontrado.<br />
                Clone usando a URL configurada em <span className="font-mono text-gray-300">GIT_REPO_URL</span>.
              </p>
              <button
                onClick={handleClone}
                disabled={loadingClone}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded px-3 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-2"
              >
                {loadingClone ? (
                  <>
                    <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                    Clonando...
                  </>
                ) : (
                  <>
                    <FaGithub className="w-3 h-3" />
                    Clonar repositório
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-white">
              <FaCodeBranch className="text-gray-400 shrink-0" />
              <span className="font-mono font-medium">{status?.branch}</span>
              {(status?.unpushedCommits ?? 0) > 0 && (
                <span className="flex items-center gap-1 text-yellow-400 text-xs">
                  <FaArrowUp className="w-3 h-3" />
                  {status?.unpushedCommits}
                </span>
              )}
              {status?.isSynced && (
                <span className="text-green-400 text-xs ml-auto">✓ sincronizado</span>
              )}
            </div>
          )}
        </div>

        {/* Changes section with checkboxes */}
        {isReady && (
          <div className="border-b border-slate-700">
            <div className="px-4 py-2 flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">
                Changes {allFiles.length > 0 && `(${allFiles.length})`}
              </span>
              {allFiles.length > 0 && (
                <button
                  onClick={toggleAll}
                  className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Checkbox checked={allSelected} />
                  Marcar todos
                </button>
              )}
            </div>

            {allFiles.length === 0 ? (
              <p className="px-4 pb-3 text-xs text-gray-500">Nenhum arquivo modificado.</p>
            ) : (
              <ul className="max-h-40 overflow-y-auto px-2 pb-2 space-y-0.5">
                {allFiles.map((file) => (
                  <li key={file.path}>
                    <label
                      onClick={() => toggleFile(file.path)}
                      className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-700 cursor-pointer group"
                    >
                      <Checkbox checked={selectedPaths.has(file.path)} />
                      <FileStatusBadge status={file.status} />
                      <span
                        className="text-xs font-mono text-gray-300 truncate"
                        title={file.path}
                      >
                        {file.path}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="px-4 py-3 flex gap-2 border-b border-slate-700">
          <button
            onClick={() => onCommitRequest([...selectedPaths])}
            disabled={!isReady || selectedCount === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded px-2 py-1.5 text-xs font-medium transition-colors"
          >
            Commit{selectedCount > 0 ? ` (${selectedCount})` : ""}
          </button>
          <button
            onClick={onPushRequest}
            disabled={!isReady || loadingPush}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded px-2 py-1.5 text-xs font-medium transition-colors flex items-center justify-center gap-1"
          >
            <FaArrowUp className="w-3 h-3" />
            {loadingPush ? "..." : "Push"}
          </button>
          <button
            onClick={onPullRequest}
            disabled={!isReady || loadingPull}
            className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded px-2 py-1.5 text-xs font-medium transition-colors flex items-center justify-center gap-1"
          >
            <FaArrowDown className="w-3 h-3" />
            {loadingPull ? "..." : "Pull"}
          </button>
        </div>

        {/* Auto-commit */}
        <div className="px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-xs">Auto-commit</span>
            <button
              onClick={handleAutoCommitToggle}
              disabled={!isReady}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                status?.autoCommitEnabled ? "bg-emerald-500" : "bg-slate-600"
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  status?.autoCommitEnabled ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-xs">Intervalo</span>
            <div className="flex gap-1">
              {INTERVAL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleIntervalChange(opt.value)}
                  disabled={!isReady}
                  className={`px-2 py-0.5 rounded text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    status?.autoCommitIntervalSeconds === opt.value
                      ? "bg-blue-600 text-white"
                      : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

    </>
  );
}
