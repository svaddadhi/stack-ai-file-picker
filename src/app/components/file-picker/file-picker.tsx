import { useCallback, useState } from "react";
import { Card } from "@/components/ui/card";
import { FileExplorer } from "./file-explorer";
import { ErrorBoundary } from "../shared/error-boundary";

export function FilePicker() {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const handleFileSelect = useCallback((fileId: string) => {
    setSelectedFiles((prev) => {
      const isSelected = prev.includes(fileId);
      if (isSelected) {
        return prev.filter((id) => id !== fileId);
      }
      return [...prev, fileId];
    });
  }, []);

  const handleFolderOpen = useCallback((folderId: string) => {
    // Implement during navigation step
    console.log("Opening folder:", folderId);
  }, []);

  return (
    <Card className="w-full max-w-4xl mx-auto p-4">
      <ErrorBoundary>
        <FileExplorer
          files={[]} // Will be populated with real data
          selectedFiles={selectedFiles}
          onFileSelect={handleFileSelect}
          onFolderOpen={handleFolderOpen}
          isLoading={false}
        />
      </ErrorBoundary>
    </Card>
  );
}
