import { Button } from "@/components/ui/button";

interface ErrorScreenProps {
  message: string;
  onRetry: () => void;
}

export function ErrorScreen({ message, onRetry }: ErrorScreenProps) {
  return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <p className="text-slate-600 mb-4">{message}</p>
        <Button
          variant="default"
          size="icon"
          title="Retry"
          onClick={onRetry}
          className="h-10 w-16 rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          Retry
        </Button>
      </div>
    </div>
  );
}