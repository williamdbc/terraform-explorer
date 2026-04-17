import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import type { ReactNode } from "react";

interface ButtonWithTooltipProps {
  text: string;
  bgColorClass: string;
  ariaLabel: string;
  onClick: () => void;
  icon: ReactNode;
}

export function ButtonWithTooltip({
  text,
  bgColorClass,
  ariaLabel,
  onClick,
  icon,
}: ButtonWithTooltipProps) {
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <Button
          variant="default"
          size="icon"
          onClick={onClick}
          aria-label={ariaLabel}
          className={`${bgColorClass} text-white cursor-pointer`}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{text}</TooltipContent>
    </Tooltip>
  );
}
