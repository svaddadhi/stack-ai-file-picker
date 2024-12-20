import { useState, useCallback } from "react";
import { FileItem } from "@/app/lib/types/file";

interface UseFileSelectionProps {
  initialSelection?: string[];
}

export function useFileSelection({
  initialSelection = [],
}: UseFileSelectionProps = {}) {
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(
    new Set(initialSelection)
  );

  const toggleSelection = useCallback(
    (fileId: string, multiSelect: boolean) => {
      setSelectedFiles((prev) => {
        const newSelection = new Set(prev);
        if (!multiSelect) {
          // If not multi-selecting, clear other selections
          newSelection.clear();
        }
        if (newSelection.has(fileId)) {
          newSelection.delete(fileId);
        } else {
          newSelection.add(fileId);
        }
        return newSelection;
      });
    },
    []
  );

  const selectRange = useCallback(
    (files: FileItem[], startId: string, endId: string) => {
      const fileIds = files.map((f) => f.resource_id);
      const startIndex = fileIds.indexOf(startId);
      const endIndex = fileIds.indexOf(endId);

      if (startIndex === -1 || endIndex === -1) return;

      const start = Math.min(startIndex, endIndex);
      const end = Math.max(startIndex, endIndex);

      const rangeIds = fileIds.slice(start, end + 1);
      setSelectedFiles(new Set(rangeIds));
    },
    []
  );

  const clearSelection = useCallback(() => {
    setSelectedFiles(new Set());
  }, []);

  const selectAll = useCallback((files: FileItem[]) => {
    setSelectedFiles(new Set(files.map((f) => f.resource_id)));
  }, []);

  return {
    selectedFiles: Array.from(selectedFiles),
    toggleSelection,
    selectRange,
    clearSelection,
    selectAll,
    isSelected: (fileId: string) => selectedFiles.has(fileId),
  };
}
