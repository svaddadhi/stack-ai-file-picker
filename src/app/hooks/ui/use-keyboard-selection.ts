import { useEffect, useRef } from "react";
import { FileItem } from "@/app/lib/types/file";

interface UseKeyboardSelectionProps {
  files: FileItem[];
  selectedFiles: string[];
  onToggleSelection: (fileId: string, multiSelect: boolean) => void;
  onSelectRange: (files: FileItem[], startId: string, endId: string) => void;
  onSelectAll: (files: FileItem[]) => void;
  onClearSelection: () => void;
}

export function useKeyboardSelection({
  files,
  selectedFiles,
  onToggleSelection,
  onSelectRange,
  onSelectAll,
  onClearSelection,
}: UseKeyboardSelectionProps) {
  const lastSelectedRef = useRef<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events when typing in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Command/Ctrl + A to select all
      if ((e.metaKey || e.ctrlKey) && e.key === "a") {
        e.preventDefault();
        onSelectAll(files);
        return;
      }

      // Escape to clear selection
      if (e.key === "Escape") {
        onClearSelection();
        return;
      }

      // Handle shift + click for range selection
      if (e.shiftKey && lastSelectedRef.current && selectedFiles.length > 0) {
        const lastSelected = lastSelectedRef.current;
        const currentSelected = selectedFiles[selectedFiles.length - 1];
        onSelectRange(files, lastSelected, currentSelected);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [files, selectedFiles, onSelectAll, onClearSelection, onSelectRange]);

  // Track last selected item for range selection
  useEffect(() => {
    if (selectedFiles.length > 0) {
      lastSelectedRef.current = selectedFiles[selectedFiles.length - 1];
    }
  }, [selectedFiles]);

  return {
    lastSelected: lastSelectedRef.current,
  };
}
