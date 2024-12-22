"use client";

import { useCallback, useEffect, useState } from "react";
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
import { useKBChildren } from "@/app/hooks/api/use-knowledge-base";
import { useNavigation } from "@/app/hooks/ui/use-navigation";
import { useFileSelection } from "@/app/hooks/ui/use-file-selection";
import { useKeyboardSelection } from "@/app/hooks/ui/use-keyboard-selection";
import { useIndexing } from "@/app/hooks/api/use-indexing";

import type { FileItem } from "@/app/lib/types/file";

interface LocalFileStatus {
  isIndexed: boolean;
  isPending: boolean;
}
type FileStatusMap = Record<string, LocalFileStatus>;

export function FilePicker() {
  const { connection } = useConnection();

  const [kbId, setKbId] = useState<string | null>(null);

  const [fileStatusMap, setFileStatusMap] = useState<FileStatusMap>({});

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
    resources: gdriveItems,
    error: gdriveError,
    isLoading: gdriveLoading,
    refreshResources: refreshGDrive,
  } = useResources({
    connectionId: connection?.connection_id || "",
    resourceId: currentResourceId,
  });

  const { kbResources, kbError, kbLoading, refreshKB } = useKBChildren(
    kbId ?? undefined,
    "/"
  );

  const {
    selectedFiles,
    toggleSelection,
    selectRange,
    clearSelection,
    selectAll,
  } = useFileSelection();
  useKeyboardSelection({
    files: gdriveItems,
    selectedFiles,
    onToggleSelection: toggleSelection,
    onSelectRange: selectRange,
    onSelectAll: selectAll,
    onClearSelection: clearSelection,
  });

  const {
    searchTerm,
    setSearchTerm,
    sortType,
    setSortType,
    sortDirection,
    toggleSortDirection,
    processFiles,
  } = useSortFilter();

  const { indexFiles, deindexFiles } = useIndexing(
    kbId,
    setKbId,
    kbResources.map((f) => f.resource_id)
  );

  useEffect(() => {
    if (!kbResources?.length) return;
    setFileStatusMap((prev) => {
      let changed = false;

      const nextMap: FileStatusMap = { ...prev };

      for (const kbFile of kbResources) {
        const id = kbFile.resource_id;
        const existing = nextMap[id];

        if (!existing || existing.isIndexed === false) {
          nextMap[id] = {
            isPending: existing?.isPending ?? false,
            isIndexed: true,
          };
          changed = true;
        }
      }

      return changed ? nextMap : prev;
    });
  }, [kbResources]);

  const handleIndex = useCallback(
    async (fileId: string) => {
      if (!connection) return;

      const file = gdriveItems.find((r) => r.resource_id === fileId);
      if (!file) return;

      setFileStatusMap((prev) => ({
        ...prev,
        [fileId]: {
          isIndexed: prev[fileId]?.isIndexed ?? false,
          isPending: true,
        },
      }));

      try {
        await indexFiles(connection.connection_id, [file]);

        setFileStatusMap((prev) => ({
          ...prev,
          [fileId]: { isIndexed: true, isPending: false },
        }));

        await refreshKB();
        await refreshGDrive();
      } catch (err) {
        console.error("Index error:", err);

        setFileStatusMap((prev) => ({
          ...prev,
          [fileId]: {
            ...prev[fileId],
            isPending: false,
          },
        }));
      }
    },
    [connection, gdriveItems, indexFiles, refreshKB, refreshGDrive]
  );

  const handleDeindex = useCallback(
    async (fileId: string) => {
      if (!kbId) {
        console.warn("No KB to remove from yet");
        return;
      }

      const file = gdriveItems.find((r) => r.resource_id === fileId);
      if (!file) {
        console.error("File not found");
        return;
      }

      setFileStatusMap((prev) => ({
        ...prev,
        [fileId]: {
          isIndexed: prev[fileId]?.isIndexed ?? false,
          isPending: true,
        },
      }));

      try {
        await deindexFiles(file);

        setFileStatusMap((prev) => ({
          ...prev,
          [fileId]: { isIndexed: false, isPending: false },
        }));

        // Re-fetch to ensure UI is in sync
        await refreshKB();
        await refreshGDrive();
      } catch (err) {
        console.error("Deindex error:", err);

        // Reset pending state but maintain previous indexed state
        setFileStatusMap((prev) => ({
          ...prev,
          [fileId]: {
            isIndexed: prev[fileId]?.isIndexed ?? false,
            isPending: false,
          },
        }));
      }
    },
    [kbId, gdriveItems, deindexFiles, refreshKB, refreshGDrive]
  );

  const mergedItems: FileItem[] = gdriveItems.map((item) => {
    const localStatus = fileStatusMap[item.resource_id] ?? {
      isPending: false,
      isIndexed: false,
    };
    return {
      ...item,
      connection_id: connection?.connection_id, // Add this
      isPending: localStatus.isPending,
      isIndexed: localStatus.isIndexed,
      status: localStatus.isPending
        ? "pending"
        : localStatus.isIndexed
        ? "indexed"
        : "not-indexed",
    };
  });

  const finalFiles = processFiles(mergedItems);

  const isLoading = gdriveLoading || kbLoading;
  const errorMsg = gdriveError?.message || kbError?.message;

  const handleFileSelect = useCallback(
    (fileId: string, e: React.MouseEvent) => {
      toggleSelection(fileId, e.metaKey || e.ctrlKey || e.shiftKey);
    },
    [toggleSelection]
  );

  const handleFolderOpen = useCallback(
    (path: string, resourceId: string) => {
      clearSelection();
      navigateToFolder(path, resourceId);
    },
    [clearSelection, navigateToFolder]
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
            onNavigate={(p) => navigateToFolder(p)}
          />
        </div>
      </div>

      <ErrorBoundary>
        <div className="p-4">
          <Toolbar
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            sortType={sortType}
            onSort={setSortType}
            sortDirection={sortDirection}
            onDirectionChange={toggleSortDirection}
          />

          <FileExplorer
            files={finalFiles}
            selectedFiles={selectedFiles}
            onFileSelect={handleFileSelect}
            onFolderOpen={(resId, path) => handleFolderOpen(path, resId)}
            onIndex={handleIndex}
            onDeindex={handleDeindex}
            isLoading={isLoading}
            error={errorMsg}
          />
        </div>
      </ErrorBoundary>
    </Card>
  );
}
