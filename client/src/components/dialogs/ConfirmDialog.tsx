import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { buttonClassesByType, buttonTextsByType, type DialogButtonType } from "@/types/DialogButtonTypes";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  cancelText?: string;
  confirmText?: string;
  type?: DialogButtonType;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  type = "default",
  title = "Confirmação",
  description = "Tem certeza que deseja prosseguir?",
  cancelText = "Cancelar",
  confirmText,
}: ConfirmDialogProps) {
  const buttonClass = buttonClassesByType[type] ?? buttonClassesByType.default;
  const confirmLabel = confirmText ?? buttonTextsByType[type] ?? buttonTextsByType.default;

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" onClick={onCancel}>
              {cancelText}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button className={buttonClass} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}