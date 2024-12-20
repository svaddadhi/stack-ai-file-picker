import { SearchBar } from "./search-bar";
import { SortDropdown } from "./sort-dropdown";

type SortType = "name" | "date" | null;

interface ToolbarProps {
  searchTerm: string;
  onSearch: (term: string) => void;
  sortType: SortType;
  onSort: (type: SortType) => void;
  sortDirection: "asc" | "desc";
  onDirectionChange: () => void;
}

export function Toolbar({
  searchTerm,
  onSearch,
  sortType,
  onSort,
  sortDirection,
  onDirectionChange,
}: ToolbarProps) {
  return (
    <div className="flex items-center gap-4 p-4 border-b">
      <SearchBar value={searchTerm} onChange={onSearch} className="flex-1" />
      <SortDropdown
        value={sortType}
        onValueChange={(value) => onSort(value as SortType)}
        direction={sortDirection}
        onDirectionChange={onDirectionChange}
      />
    </div>
  );
}
