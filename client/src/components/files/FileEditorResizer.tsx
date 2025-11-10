interface FileEditorResizerProps {
  modalHeight: number;
  onHeightChange: (height: number) => void;
}

export function FileEditorResizer({ modalHeight, onHeightChange }: FileEditorResizerProps) {
  return (
    <div
      className="h-1 cursor-row-resize bg-slate-700 hover:bg-slate-600 transition-colors"
      onMouseDown={(e) => {
        const startY = e.clientY;
        const startH = modalHeight;
        const onMove = (ev: MouseEvent) => {
          const delta = ev.clientY - startY;
          const newH = Math.max(300, Math.min(window.innerHeight * 0.95, startH + delta));
          onHeightChange(Math.round(newH));
        };
        const onUp = () => {
          window.removeEventListener("mousemove", onMove);
          window.removeEventListener("mouseup", onUp);
        };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
      }}
    />
  );
}