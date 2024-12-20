import { memo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FileIcon, FolderIcon } from "lucide-react";

interface FileItemProps {
  id: string;
  name: string;
  type: "file" | "directory";
  path: string;
  isSelected: boolean;
  isIndexed: boolean;
  metadata?: {
    size?: number;
    modifiedDate?: string;
    type?: string;
  };
  onSelect: () => void;
  onOpen?: () => void;
  onIndex: () => void;
  onDeindex: () => void;
}

export const FileItem = memo(function FileItem({
  name,
  type,
  isSelected,
  isIndexed,
  onSelect,
  onOpen,
  onDeindex,
  onIndex,
}: FileItemProps) {
  const Icon = type === "directory" ? FolderIcon : FileIcon;

  // Handle double click with proper event type
  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onOpen) {
      e.preventDefault();
      onOpen();
    }
  };

  return (
    <div
      className={`flex items-center p-2 rounded-lg gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 ${
        isSelected ? "bg-gray-50 dark:bg-gray-900" : ""
      }`}
      onDoubleClick={handleDoubleClick}
    >
      <Checkbox checked={isSelected} onCheckedChange={() => onSelect()} />
      <Icon className="h-4 w-4 text-gray-500" />
      <span className="flex-grow truncate">{name}</span>
      {type === "file" && (
        <Button
          variant={isIndexed ? "outline" : "secondary"}
          size="sm"
          onClick={isIndexed ? onDeindex : onIndex}
        >
          {isIndexed ? "Indexed" : "Index"}
        </Button>
      )}
    </div>
  );
});
