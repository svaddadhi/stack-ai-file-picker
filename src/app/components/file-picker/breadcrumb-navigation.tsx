import { ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BreadcrumbNavigationProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function BreadcrumbNavigation({
  currentPath,
  onNavigate,
}: BreadcrumbNavigationProps) {
  const segments = currentPath.split("/").filter(Boolean);

  return (
    <div className="flex items-center gap-1 px-2 py-1 overflow-x-auto">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2"
        onClick={() => onNavigate("/")}
      >
        <Home className="h-4 w-4" />
      </Button>

      {segments.map((segment, index) => {
        const path = "/" + segments.slice(0, index + 1).join("/");
        return (
          <div key={path} className="flex items-center">
            <ChevronRight className="h-4 w-4 text-gray-500" />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => onNavigate(path)}
            >
              {segment}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
