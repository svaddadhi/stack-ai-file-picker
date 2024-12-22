"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { FileExplorer } from "./FileExplorer";
import { BreadcrumbNavigation } from "./BreadcrumbNavigation";
import { ErrorBoundary } from "../shared/ErrorBoundary";
import { Toolbar } from "./toolbar";

import { useSortFilter } from "@/app/hooks/ui/useSortFilter";
import { useConnection } from "@/app/hooks/api/useConnection";
import { useResources } from "@/app/hooks/api/useResources";
import { useKBChildren } from "@/app/hooks/api/useKnowledgeBase";
import { useNavigation } from "@/app/hooks/ui/useNavigation";
import { useFileSelection } from "@/app/hooks/ui/useFileSelection";
import { useKeyboardSelection } from "@/app/hooks/ui/useKeyboardSelection";
import { useIndexing } from "@/app/hooks/api/useIndexing";

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
    currentPath || "/"
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
    kbResources.map((r) => r.resource_id)
  );

  useEffect(() => {
    if (!kbResources?.length) return;
    setFileStatusMap((prev) => {
      const nextMap: FileStatusMap = { ...prev };
      let changed = false;
      for (const kbFile of kbResources) {
        if (
          !nextMap[kbFile.resource_id] ||
          !nextMap[kbFile.resource_id].isIndexed
        ) {
          nextMap[kbFile.resource_id] = {
            isIndexed: true,
            isPending: nextMap[kbFile.resource_id]?.isPending ?? false,
          };
          changed = true;
        }
      }
      return changed ? nextMap : prev;
    });
  }, [kbResources]);

  function toIndexStatus(isPending: boolean, isIndexed: boolean) {
    if (isPending) return "pending" as const;
    if (isIndexed) return "indexed" as const;
    return "not-indexed" as const;
  }

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
        // Reset pending
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
      if (!connection) return; // If no GDrive connection, we can't remove anyway
      if (!kbId) {
        console.warn("[FilePicker] No KB to remove from yet; ignoring.");
        return;
      }
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
        await deindexFiles(file);

        setFileStatusMap((prev) => ({
          ...prev,
          [fileId]: { isIndexed: false, isPending: false },
        }));

        await refreshKB();
        await refreshGDrive();
      } catch (err) {
        console.error("Deindex error:", err);
        setFileStatusMap((prev) => ({
          ...prev,
          [fileId]: {
            isIndexed: prev[fileId]?.isIndexed ?? false,
            isPending: false,
          },
        }));
      }
    },
    [connection, kbId, gdriveItems, deindexFiles, refreshKB, refreshGDrive]
  );

  const mergedItems: FileItem[] = gdriveItems.map((item) => {
    const localStatus = fileStatusMap[item.resource_id] ?? {
      isPending: false,
      isIndexed: false,
    };
    return {
      ...item,
      connection_id: connection?.connection_id, // ensure we set this
      isPending: localStatus.isPending,
      isIndexed: localStatus.isIndexed,
      status: toIndexStatus(localStatus.isPending, localStatus.isIndexed),
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
