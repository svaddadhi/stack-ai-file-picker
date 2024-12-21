import { useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FileExplorer } from "./file-explorer";
import { BreadcrumbNavigation } from "./breadcrumb-navigation";
import { ErrorBoundary } from "../shared/error-boundary";
import { Toolbar } from "./toolbar";
import { useSortFilter } from "@/app/hooks/ui/use-sort-filter";
import { useConnection } from "@/app/hooks/api/use-connection";
import { useResources } from "@/app/hooks/api/use-resources";
import { useNavigation } from "@/app/hooks/ui/use-navigation";
import { useFileSelection } from "@/app/hooks/ui/use-file-selection";
import { useKeyboardSelection } from "@/app/hooks/ui/use-keyboard-selection";
import { useIndexing } from "@/app/hooks/api/use-indexing";

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

  const {
    searchTerm,
    setSearchTerm,
    sortType,
    setSortType,
    sortDirection,
    toggleSortDirection,
    processFiles,
  } = useSortFilter();

  const { resources, isLoading, error } = useResources({
    connectionId: connection?.connection_id || "",
    resourceId: currentResourceId,
  });

  const {
    selectedFiles,
    toggleSelection,
    selectRange,
    clearSelection,
    selectAll,
  } = useFileSelection();

  // Keyboard selection logs
  useKeyboardSelection({
    files: resources || [],
    selectedFiles,
    onToggleSelection: toggleSelection,
    onSelectRange: selectRange,
    onSelectAll: selectAll,
    onClearSelection: clearSelection,
  });

  const handleFileSelect = useCallback(
    (fileId: string, e: React.MouseEvent) => {
      console.log(
        "[FilePicker] handleFileSelect - fileId:",
        fileId,
        "multiSelect:",
        e.metaKey || e.ctrlKey || e.shiftKey
      );
      toggleSelection(fileId, e.metaKey || e.ctrlKey || e.shiftKey);
    },
    [toggleSelection]
  );

  const handleFolderOpen = useCallback(
    (path: string, resourceId: string) => {
      console.log(
        "[FilePicker] handleFolderOpen - path:",
        path,
        "resourceId:",
        resourceId
      );
      clearSelection();
      navigateToFolder(path, resourceId);
    },
    [navigateToFolder, clearSelection]
  );

  const { indexFiles, isPending } = useIndexing();

  const handleIndex = useCallback(
    async (fileId: string) => {
      console.log("[FilePicker] handleIndex - indexing fileId:", fileId);
      const file = resources.find((r) => r.resource_id === fileId);
      if (!file || !connection) {
        console.error(
          "[FilePicker] handleIndex - file or connection not found"
        );
        return;
      }

      try {
        await indexFiles(connection.connection_id, [file]);
        console.log(
          "[FilePicker] handleIndex - indexing complete for fileId:",
          fileId
        );
      } catch (error) {
        console.error(
          "[FilePicker] handleIndex - Failed to index file:",
          error
        );
      }
    },
    [connection, resources, indexFiles]
  );

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              console.log("[FilePicker] navigateBack");
              navigateBack();
            }}
            disabled={!canGoBack}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              console.log("[FilePicker] navigateForward");
              navigateForward();
            }}
            disabled={!canGoForward}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <BreadcrumbNavigation
            currentPath={currentPath}
            onNavigate={(path) => {
              console.log("[FilePicker] Breadcrumb navigate to:", path);
              navigateToFolder(path);
            }}
          />
        </div>
      </div>

      <ErrorBoundary>
        <div className="p-4">
          <Toolbar
            searchTerm={searchTerm}
            onSearch={(term) => {
              console.log("[FilePicker] Search changed:", term);
              setSearchTerm(term);
            }}
            sortType={sortType}
            onSort={(type) => {
              console.log("[FilePicker] Sort changed:", type);
              setSortType(type);
            }}
            sortDirection={sortDirection}
            onDirectionChange={() => {
              console.log("[FilePicker] Toggling sort direction");
              toggleSortDirection();
            }}
          />
          <FileExplorer
            files={processFiles(resources)}
            selectedFiles={selectedFiles}
            onFileSelect={handleFileSelect}
            onFolderOpen={(resourceId, path) =>
              handleFolderOpen(path, resourceId)
            }
            onIndex={handleIndex}
            isLoading={isLoading}
            error={error?.message}
          />
        </div>
      </ErrorBoundary>
    </Card>
  );
}
