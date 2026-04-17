import { Button } from "@/components/ui/button";
import { type DialogButtonType, buttonClassesByType, buttonTextsByType } from "@/types/DialogButtonTypes";

interface DialogFooterButtonsProps {
  loading?: boolean;
  onCancel: () => void;
  confirmText?: string;
  confirmClassName?: string;
  type?: DialogButtonType;
}

export function DialogFooterButtons({
  loading = false,
  onCancel,
  confirmText,
  confirmClassName,
  type = "default",
}: DialogFooterButtonsProps) {
  const buttonClass = confirmClassName ?? buttonClassesByType[type];
  const confirmLabel = confirmText ?? buttonTextsByType[type];

  return (
    <div className="flex justify-end gap-3 mt-6">
      <Button variant="outline" onClick={onCancel} disabled={loading}>
        Cancelar
      </Button>
      <Button className={buttonClass} type="submit" disabled={loading}>
        {loading ? "Carregando..." : confirmLabel}
      </Button>
    </div>
  );
}