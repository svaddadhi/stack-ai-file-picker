import { FileItem as FileItemType } from "@/app/lib/types/file";
import { FileItem } from "./file-item";

interface FileListProps {
  files: FileItemType[];
  selectedFiles: string[];
  onFileSelect: (fileId: string) => void;
  onFolderOpen: (resourceId: string, path: string) => void;
}

export function FileList({
  files,
  selectedFiles,
  onFileSelect,
  onFolderOpen,
}: FileListProps) {
  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-500">
        No files found
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {files.map((file) => (
        <FileItem
          key={file.resource_id}
          id={file.resource_id}
          name={file.name}
          type={file.inode_type}
          path={file.inode_path.path}
          isSelected={selectedFiles.includes(file.resource_id)}
          isIndexed={file.status === "indexed"}
          metadata={file.metadata}
          onSelect={() => onFileSelect(file.resource_id)}
          onOpen={
            file.inode_type === "directory"
              ? () => onFolderOpen(file.resource_id, file.inode_path.path)
              : undefined
          }
          onIndex={() => console.log("Index:", file.resource_id)}
          onDeindex={() => console.log("Deindex:", file.resource_id)}
        />
      ))}
    </div>
  );
}
