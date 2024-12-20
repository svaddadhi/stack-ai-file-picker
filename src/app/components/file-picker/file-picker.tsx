import { useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FileExplorer } from "./file-explorer";
import { BreadcrumbNavigation } from "./breadcrumb-navigation";
import { useConnection } from "@/app/hooks/api/use-connection";
import { useResources } from "@/app/hooks/api/use-resources";
import { useNavigation } from "@/app/hooks/ui/use-navigation";
import { ErrorBoundary } from "../shared/error-boundary";

export function FilePicker() {
  const { connection } = useConnection();
  const {
    currentPath,
    currentResourceId,
    navigateToFolder,
    navigateBack,
    navigateForward,
    canGoBack,
    canGoForward,
  } = useNavigation();

  const { resources, isLoading, error } = useResources({
    connectionId: connection?.connection_id || "",
    resourceId: currentResourceId,
  });

  const handleFileSelect = useCallback((fileId: string) => {
    // Will be implemented in the selection phase
    console.log("Selected:", fileId);
  }, []);

  const handleFolderOpen = useCallback(
    (path: string, resourceId: string) => {
      navigateToFolder(path, resourceId);
    },
    [navigateToFolder]
  );

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={navigateBack}
            disabled={!canGoBack}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={navigateForward}
            disabled={!canGoForward}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <BreadcrumbNavigation
            currentPath={currentPath}
            onNavigate={(path) => navigateToFolder(path)}
          />
        </div>
      </div>

      <ErrorBoundary>
        <div className="p-4">
          <FileExplorer
            files={resources}
            selectedFiles={[]}
            onFileSelect={handleFileSelect}
            onFolderOpen={(resourceId, path) =>
              handleFolderOpen(path, resourceId)
            }
            isLoading={isLoading}
            error={error?.message}
          />
        </div>
      </ErrorBoundary>
    </Card>
  );
}
