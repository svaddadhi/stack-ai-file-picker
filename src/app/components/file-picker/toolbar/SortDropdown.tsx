import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

type SortType = "name" | "date" | null;

interface SortDropdownProps {
  value: SortType;
  onValueChange: (value: SortType) => void;
  direction: "asc" | "desc";
  onDirectionChange: () => void;
}

export function SortDropdown({
  value,
  onValueChange,
  direction,
  onDirectionChange,
}: SortDropdownProps) {
  return (
    <div className="flex items-center gap-2">
      <Select
        value={value || "none"}
        onValueChange={(val) =>
          onValueChange(val === "none" ? null : (val as SortType))
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          <SelectItem value="name">Name</SelectItem>
          <SelectItem value="date">Date Modified</SelectItem>
        </SelectContent>
      </Select>
      {value && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onDirectionChange}
          className="h-9 w-9"
        >
          <ArrowUpDown
            className={`h-4 w-4 ${
              direction === "desc" ? "rotate-180" : ""
            } transform transition-transform`}
          />
        </Button>
      )}
    </div>
  );
}
