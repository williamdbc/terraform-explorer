import {
  CircleCheckIcon,
  CircleXIcon,
  InfoIcon,
  Loader2Icon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      toastOptions={{
        duration: 5000,
        closeButton: true,
        classNames: {
          toast: "!text-sm",
          success: "!bg-green-600 !text-white !border-green-700",
          error: "!bg-red-600 !text-white !border-red-700",
          warning: "!bg-yellow-500 !text-white !border-yellow-600",
          info: "!bg-blue-600 !text-white !border-blue-700",
        },
        style: {
          padding: "20x",
          borderRadius: "10px",
        },
      }}
      icons={{
        success: <CircleCheckIcon className="w-5 h-5" />,
        info: <InfoIcon className="w-5 h-5" />,
        warning: <TriangleAlertIcon className="w-5 h-5" />,
        error: <CircleXIcon className="w-5 h-5" />,
        loading: <Loader2Icon className="w-5 h-5 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />

  );
};

export { Toaster };