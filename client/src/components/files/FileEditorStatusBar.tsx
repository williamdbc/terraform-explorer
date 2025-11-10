interface FileEditorStatusBarProps {
  caret: { line: number; column: number };
  charCount: number;
  byteSize: number;
  modified: boolean;
}

export function FileEditorStatusBar({
  caret,
  charCount,
  byteSize,
  modified,
}: FileEditorStatusBarProps) {
  return (
    <div className="px-4 py-2 bg-slate-800 border-t border-slate-700 flex items-center justify-between text-xs text-slate-400 font-mono">
      <div>Ln {caret.line}, Col {caret.column}</div>
      <div>{charCount} chars • {byteSize} bytes</div>
      <div className={modified ? "text-amber-400" : "text-green-400"}>
        {modified ? "Modified" : "Saved"}
      </div>
    </div>
  );
}