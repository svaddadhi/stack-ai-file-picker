import { Badge } from "@/components/ui/badge";
import { CircleSlash, CheckCircle2, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

type IndexStatus = "indexed" | "pending" | "not-indexed";

interface StatusIndicatorProps {
  status: IndexStatus;
  className?: string;
}

export function StatusIndicator({ status, className }: StatusIndicatorProps) {
  return (
    <Badge
      variant={
        status === "indexed"
          ? "default"
          : status === "pending"
          ? "secondary"
          : "outline"
      }
      className={cn("gap-1", className)}
    >
      {status === "indexed" ? (
        <CheckCircle2 className="h-3 w-3" />
      ) : status === "pending" ? (
        <Timer className="h-3 w-3 animate-spin" />
      ) : (
        <CircleSlash className="h-3 w-3" />
      )}
      {status === "indexed"
        ? "Indexed"
        : status === "pending"
        ? "Indexing..."
        : "Not Indexed"}
    </Badge>
  );
}
