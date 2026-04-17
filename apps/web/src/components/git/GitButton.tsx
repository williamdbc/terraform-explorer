import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { FaCodeBranch } from "react-icons/fa";
import { GitService } from "@/services/GitService";
import { GitStatusPanel } from "./GitStatusPanel";
import { GitCommitDialog } from "./GitCommitDialog";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import type { GitStatusResponse } from "@/interfaces/responses/GitStatusResponse";

export function GitButton() {
  const [status, setStatus] = useState<GitStatusResponse | null>(null);
  const [open, setOpen] = useState(false);

  // Dialog states — lifted here so they survive when the panel closes
  const [commitOpen, setCommitOpen] = useState(false);
  const [commitFiles, setCommitFiles] = useState<string[]>([]);
  const [confirmPush, setConfirmPush] = useState(false);
  const [confirmPull, setConfirmPull] = useState(false);
  const [loadingPush, setLoadingPush] = useState(false);
  const [loadingPull, setLoadingPull] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  // Ref-based flag so the mousedown handler always sees current value
  // without needing to be re-registered on every dialog state change
  const anyDialogOpenRef = useRef(false);
  anyDialogOpenRef.current = commitOpen || confirmPush || confirmPull;

  const CACHE_KEY = "git_status_cache";

  const fetchStatus = async () => {
    try {
      const s = await GitService.getStatus();
      setStatus(s);
      localStorage.setItem(CACHE_KEY, JSON.stringify(s));
    } catch {}
  };

  useEffect(() => {
    // Show cached status instantly while fetching fresh data
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try { setStatus(JSON.parse(cached)); } catch {}
    }

    fetchStatus();
    const interval = setInterval(fetchStatus, 10_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Refetch immediately when the user switches back to this tab
    const handler = () => {
      if (document.visibilityState === "visible") fetchStatus();
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      // Never close while a dialog is open — portals render outside ref.current
      if (anyDialogOpenRef.current) return;
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handlePushConfirmed = async () => {
    setConfirmPush(false);
    setLoadingPush(true);
    try {
      await GitService.push();
      toast.success("Push realizado com sucesso.");
      fetchStatus();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? "Erro ao fazer push.");
    } finally {
      setLoadingPush(false);
    }
  };

  const handlePullConfirmed = async () => {
    setConfirmPull(false);
    setLoadingPull(true);
    try {
      const res = await GitService.pull();
      toast.success(res.message || "Pull realizado com sucesso.");
      fetchStatus();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? "Erro ao fazer pull.");
    } finally {
      setLoadingPull(false);
    }
  };

  const renderBadge = () => {
    if (!status?.isInitialized) {
      return <span className="text-xs text-gray-500">sem repo</span>;
    }

    const color = status.modifiedFiles > 0 ? "text-yellow-400" : "text-green-400";
    const count = status.modifiedFiles > 0 ? ` ${status.modifiedFiles}` : " ✓";

    return (
      <span className={`text-xs font-mono ${color}`}>
        {status.branch}{count}
      </span>
    );
  };

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Git"
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-white transition-colors"
        >
          <FaCodeBranch className="w-4 h-4 text-gray-300" />
          {renderBadge()}
        </button>

        {open && (
          <GitStatusPanel
            status={status}
            loadingPush={loadingPush}
            loadingPull={loadingPull}
            onRefresh={fetchStatus}
            onCommitRequest={(files) => {
              setCommitFiles(files);
              setCommitOpen(true);
            }}
            onPushRequest={() => setConfirmPush(true)}
            onPullRequest={() => setConfirmPull(true)}
          />
        )}
      </div>

      {/* Dialogs rendered outside the panel so they survive setOpen(false) */}
      <GitCommitDialog
        open={commitOpen}
        selectedFiles={commitFiles}
        onClose={() => setCommitOpen(false)}
        onSuccess={() => {
          setCommitOpen(false);
          fetchStatus();
        }}
      />

      <ConfirmDialog
        open={confirmPush}
        title="Confirmar Push"
        description={`Enviar ${status?.unpushedCommits ?? 0} commit(s) para o repositório remoto?`}
        confirmText="Push"
        onCancel={() => setConfirmPush(false)}
        onConfirm={handlePushConfirmed}
      />

      <ConfirmDialog
        open={confirmPull}
        title="Confirmar Pull"
        description="Puxar as últimas alterações do repositório remoto? Alterações locais não commitadas podem ser afetadas."
        confirmText="Pull"
        onCancel={() => setConfirmPull(false)}
        onConfirm={handlePullConfirmed}
      />
    </>
  );
}
