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
  const containerRef = useRef<HTMLDivElement>(null);

  const syncScroll = () => {
    if (!textareaRef.current || !preRef.current) return;
    preRef.current.scrollTop = textareaRef.current.scrollTop;
    preRef.current.scrollLeft = textareaRef.current.scrollLeft;
  };

  useEffect(() => {
    if (!preRef.current) return;

    const cached = preRef.current.dataset.content;
    if (cached === content) return;

    const lines = content.split("\n");
    const highlighted = lines
      .map((line) => {
        const commentIndex = line.indexOf("#");
        if (commentIndex === -1) {
          return escapeHtmlForDisplay(line || " ");
        }
        const code = line.slice(0, commentIndex);
        const comment = line.slice(commentIndex);
        return `${escapeHtmlForDisplay(code)}<span class="text-gray-500">${escapeHtmlForDisplay(comment)}</span>`;
      })
      .join("\n");

    preRef.current.innerHTML = highlighted + (content.endsWith("\n") ? "\n" : "");
    preRef.current.dataset.content = content;
  }, [content]);

  useEffect(() => {
    const textarea = textareaRef.current;
    const pre = preRef.current;
    if (!textarea || !pre) return;

    const syncStyles = () => {
      const style = getComputedStyle(textarea);
      pre.style.font = style.font;
      pre.style.letterSpacing = style.letterSpacing;
      pre.style.wordSpacing = style.wordSpacing;
      syncScroll();
    };

    syncStyles();
    const observer = new ResizeObserver(syncStyles);
    observer.observe(textarea);

    return () => observer.disconnect();
  }, [content]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      <pre
        ref={preRef}
        className="pointer-events-none absolute inset-0 p-4 select-none overflow-hidden whitespace-pre-wrap wrap-break-word font-mono text-sm text-slate-200"
        style={{
          lineHeight: "1.5",
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
        className="absolute inset-0 h-full w-full resize-none bg-transparent p-4 text-transparent caret-white font-mono text-sm focus:outline-none"
        style={{
          lineHeight: "1.5",
          tabSize: 2,
        }}
        spellCheck={false}
        placeholder="# Edite o conteúdo..."
        disabled={disabled}
      />
    </div>
  );
}