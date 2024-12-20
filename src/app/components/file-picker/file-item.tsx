import { memo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FileIcon, FolderIcon } from "lucide-react";
import { StatusIndicator } from "./status-indicator";

interface FileItemProps {
  id: string;
  name: string;
  type: "file" | "directory";
  path: string;
  isSelected: boolean;
  isIndexed: boolean;
  isPending?: boolean;
  metadata?: {
    size?: number;
    modifiedDate?: string;
    type?: string;
  };
  onSelect: (e: React.MouseEvent) => void;
  onOpen?: () => void;
  onIndex: () => void;
  onDeindex: () => void;
}

export const FileItem = memo(function FileItem({
  name,
  type,
  isSelected,
  isIndexed,
  isPending,
  onSelect,
  onOpen,
  onDeindex,
  onIndex,
}: FileItemProps) {
  const Icon = type === "directory" ? FolderIcon : FileIcon;

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onOpen) {
      e.preventDefault();
      onOpen();
    }
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelect(e);
  };

  return (
    <div
      className={`flex items-center p-2 rounded-lg gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 ${
        isSelected ? "bg-gray-50 dark:bg-gray-900" : ""
      }`}
      onDoubleClick={handleDoubleClick}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => {
          const syntheticEvent = new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            buttons: 1,
          });
          onSelect(syntheticEvent as unknown as React.MouseEvent);
        }}
      />
      <Icon className="h-4 w-4 text-gray-500" />
      <span
        className="flex-grow truncate cursor-pointer"
        onClick={handleSelect}
      >
        {name}
      </span>
      {type === "file" && (
        <>
          <StatusIndicator
            status={
              isPending ? "pending" : isIndexed ? "indexed" : "not-indexed"
            }
          />
          <Button
            variant={isIndexed ? "outline" : "secondary"}
            size="sm"
            onClick={isIndexed ? onDeindex : onIndex}
            disabled={isPending}
          >
            {isIndexed ? "Remove" : "Index"}
          </Button>
        </>
      )}
    </div>
  );
});
