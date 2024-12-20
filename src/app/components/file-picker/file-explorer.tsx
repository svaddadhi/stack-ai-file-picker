import { FileList } from "./file-list";
import { LoadingSkeleton } from "../shared/loading-skeleton";
import { ErrorMessage } from "../shared/error-message";
import { FileItem } from "@/app/lib/types/file";

interface FileExplorerProps {
  files: FileItem[];
  selectedFiles: string[];
  onFileSelect: (fileId: string, e: React.MouseEvent) => void;
  onFolderOpen: (resourceId: string, path: string) => void;
  onIndex: (fileId: string) => Promise<void>;
  isLoading: boolean;
  error?: string;
}

export function FileExplorer({
  files,
  selectedFiles,
  onFileSelect,
  onFolderOpen,
  onIndex,
  isLoading,
  error,
}: FileExplorerProps) {
  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-[400px]">
      <FileList
        files={files}
        selectedFiles={selectedFiles}
        onFileSelect={onFileSelect}
        onFolderOpen={onFolderOpen}
        onIndex={onIndex}
      />
    </div>
  );
}
