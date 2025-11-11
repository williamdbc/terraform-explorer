import { Terminal, X } from 'lucide-react';

import {AnsiUp} from 'ansi_up';
import type { CommandResponse } from '@/interfaces/responses/CommandResponse';

interface TerminalTabsProps {
  outputs: Map<string, CommandResponse[]>;
  activeTab: string | null;
  onTabChange: (tab: string | null) => void;
  onClearTab: (tab: string) => void;
  onClearOutput: (tab: string, index: number) => void;
}

export function TerminalTabs({
  outputs,
  activeTab,
  onTabChange,
  onClearTab,
  onClearOutput,
}: TerminalTabsProps & { onClearOutput: (tab: string, index: number) => void }) {
  const tabs = Array.from(outputs.keys());

  return (
    <div className="h-full flex flex-col bg-slate-900">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center gap-2 flex-1 min-w-0 overflow-x-auto">
          {tabs.length === 0 ? (
            <div className="flex items-center gap-2 text-slate-400">
              <Terminal className="w-4 h-4 shrink-0" />
              <span className="text-xs">Nenhuma saída</span>
            </div>
          ) : (
            tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => onTabChange(activeTab === tab ? null : tab)}
                className={`px-3 py-1.5 text-xs rounded whitespace-nowrap transition-colors flex items-center gap-1 ${
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                <span title={tab} className="truncate max-w-60">
                  {tab}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearTab(tab);
                  }}
                  className="p-0.5 hover:bg-slate-600 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </button>
            ))
          )}
        </div>

        <div className="flex items-center gap-2" />
      </div>

      {activeTab && outputs.get(activeTab) && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {outputs.get(activeTab)!.map((output, index) => (
            <div
              key={index}
              className="border border-slate-700 rounded-lg overflow-hidden relative"
            >
              <div className="bg-slate-800 px-3 py-2 flex items-center justify-between">
                <span className="text-xs font-mono text-emerald-400">
                  {output.command}
                </span>
                <div className="flex items-end gap-3">
                  <span className="text-xs text-slate-400">
                    {output.timestamp.toLocaleTimeString()}
                  </span>
                  {"executionTimeMs" in output && (
                    <span className="text-xs text-slate-400">
                      {output.executionTimeMs > 1000
                        ? `${(output.executionTimeMs / 1000).toFixed(2)}s`
                        : `${output.executionTimeMs}ms`}
                    </span>
                  )}
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded ${
                      output.exitCode === 0
                        ? "bg-green-900/50 text-green-400"
                        : "bg-red-900/50 text-red-400"
                    }`}
                  >
                    Exit {output.exitCode}
                  </span>

                       <button
                  type="button"
                  onClick={() => onClearOutput(activeTab, index)}
                  className="ml-2 text-red-500 hover:text-red-600"
                  title="Remover output"
                >
                  <X className="w-4 h-4" />
                </button>
                </div>
           
              </div>
              <pre className="p-3 text-xs font-mono overflow-x-auto bg-slate-950 text-slate-100 whitespace-pre-wrap wrap-break-word">
                <div
                  dangerouslySetInnerHTML={{
                    __html: new AnsiUp().ansi_to_html(output.output || ""),
                  }}
                />
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
