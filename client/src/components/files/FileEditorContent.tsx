import { useRef } from "react";

interface FileEditorContentProps {
  loading: boolean;
  content: string;
  disabled: boolean;
  onContentChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onCaretUpdate: () => void;
}

export function FileEditorContent({
  loading,
  content,
  disabled,
  onContentChange,
  onKeyDown,
  onCaretUpdate,
}: FileEditorContentProps) {
  const taRef = useRef<HTMLTextAreaElement>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <textarea
      ref={taRef}
      value={content}
      onChange={(e) => onContentChange(e.target.value)}
      onKeyDown={onKeyDown}
      onClick={onCaretUpdate}
      onKeyUp={onCaretUpdate}
      onSelect={onCaretUpdate}
      className="w-full h-full p-4 bg-slate-900 text-green-400 font-mono text-sm resize-none focus:outline-none caret-green-400"
      spellCheck={false}
      style={{ tabSize: 2, lineHeight: "1.6" }}
      placeholder="# Edite o conteúdo..."
      disabled={disabled}
    />
  );
}