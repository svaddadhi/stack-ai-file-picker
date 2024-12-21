import { memo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FileIcon, FolderIcon, Loader2 } from "lucide-react";
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
  id,
  name,
  type,
  path,
  isSelected,
  isIndexed,
  isPending,
  onSelect,
  onOpen,
  onIndex,
  onDeindex,
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

  const handleCheckboxChange = () => {
    const syntheticEvent = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      buttons: 1,
      ctrlKey: true,
    });
    onSelect(syntheticEvent as unknown as React.MouseEvent);
  };

  return (
    <div
      className={`flex items-center p-2 rounded-lg gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 ${
        isSelected ? "bg-gray-50 dark:bg-gray-900" : ""
      }`}
      onDoubleClick={handleDoubleClick}
    >
      <Checkbox checked={isSelected} onCheckedChange={handleCheckboxChange} />

      <Icon className="h-4 w-4 text-gray-500" />

      <span
        className="flex-grow truncate cursor-pointer text-foreground"
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
            variant={isIndexed ? "destructive" : "secondary"}
            size="sm"
            onClick={isIndexed ? onDeindex : onIndex}
            disabled={isPending}
            className="w-24 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Indexing...
              </>
            ) : isIndexed ? (
              "Remove"
            ) : (
              "Index"
            )}
          </Button>
        </>
      )}
    </div>
  );
});
