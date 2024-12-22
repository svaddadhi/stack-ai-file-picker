import { FileItem as FileItemType } from "@/app/lib/types/file";
import { FileItem } from "./file-item";

interface FileListProps {
  files: FileItemType[];
  selectedFiles: string[];
  onFileSelect: (fileId: string, e: React.MouseEvent) => void;
  onFolderOpen: (resourceId: string, path: string) => void;
  onIndex: (fileId: string) => Promise<void>;
  onDeindex: (fileId: string) => Promise<void>;
}

export function FileList({
  files,
  selectedFiles,
  onFileSelect,
  onFolderOpen,
  onIndex,
  onDeindex,
}: FileListProps) {
  console.log("FileList resources:", files);

  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-500">
        No files found
      </div>
    );
  }

  const ensureLeadingSlash = (p: string) => (p.startsWith("/") ? p : "/" + p);

  return (
    <div className="space-y-1">
      {files.map((file) => {
        const displayName =
          file.inode_path.path.split("/").pop() || file.inode_path.path;

        return (
          <FileItem
            key={file.resource_id}
            id={file.resource_id}
            name={displayName}
            type={file.inode_type}
            path={file.inode_path.path}
            isSelected={selectedFiles.includes(file.resource_id)}
            isIndexed={file.status === "indexed"}
            isPending={file.isPending}
            metadata={file.metadata}
            onSelect={(e) => onFileSelect(file.resource_id, e)}
            onOpen={
              file.inode_type === "directory"
                ? () =>
                    onFolderOpen(
                      file.resource_id,
                      ensureLeadingSlash(file.inode_path.path)
                    )
                : undefined
            }
            onIndex={() => onIndex(file.resource_id)}
            onDeindex={() => onDeindex(file.resource_id)}
          />
        );
      })}
    </div>
  );
}
