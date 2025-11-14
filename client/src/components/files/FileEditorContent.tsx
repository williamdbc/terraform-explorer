import { escapeHtmlForDisplay } from "@/utils/html";
import { useRef, useEffect } from "react";

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const syncScroll = () => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  useEffect(() => {
    if (!preRef.current) return;

    const cached = preRef.current.dataset.content;
    if (cached === content) return;

    const highlighted = content
      .split("\n")
      .map((line) => {
        const commentIndex = line.indexOf("#");
        if (commentIndex === -1) {
          return escapeHtmlForDisplay(line);
        }
        const code = line.slice(0, commentIndex);
        const comment = line.slice(commentIndex);
        return `${escapeHtmlForDisplay(code)}<span class="text-gray-500">${escapeHtmlForDisplay(comment)}</span>`;
      })
      .join("\n");

    preRef.current.innerHTML = highlighted;
    preRef.current.dataset.content = content;
  }, [content]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      <pre
        ref={preRef}
        className="absolute inset-0 p-4 pointer-events-none overflow-hidden whitespace-pre-wrap wrap-break-word font-mono text-sm text-slate-200"
        style={{
          lineHeight: "1.6",
          tabSize: 2,
          margin: 0,
        }}
        aria-hidden="true"
        data-content=""
      />

      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        onKeyDown={onKeyDown}
        onClick={onCaretUpdate}
        onKeyUp={onCaretUpdate}
        onSelect={onCaretUpdate}
        onScroll={syncScroll}
        className="absolute inset-0 w-full h-full p-4 bg-transparent text-transparent caret-white font-mono text-sm resize-none focus:outline-none"
        style={{
          tabSize: 2,
          lineHeight: "1.6",
        }}
        spellCheck={false}
        placeholder="# Edite o conteúdo..."
        disabled={disabled}
      />
    </div>
  );
}