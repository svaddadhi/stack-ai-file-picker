import { useState, useCallback, useMemo } from "react";
import type { FileItem } from "@/app/lib/types/file";

type SortType = "name" | "date" | null;
type SortDirection = "asc" | "desc";

export function useSortFilter() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState<SortType>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const sortFiles = useCallback(
    (files: FileItem[]) => {
      if (!sortType) return files;

      return [...files].sort((a, b) => {
        let comparison = 0;
        if (sortType === "name") {
          comparison = a.name.localeCompare(b.name);
        } else if (
          sortType === "date" &&
          a.metadata?.modifiedDate &&
          b.metadata?.modifiedDate
        ) {
          comparison =
            new Date(a.metadata.modifiedDate).getTime() -
            new Date(b.metadata.modifiedDate).getTime();
        }
        return sortDirection === "asc" ? comparison : -comparison;
      });
    },
    [sortType, sortDirection]
  );

  const filterFiles = useCallback(
    (files: FileItem[]) => {
      if (!searchTerm) return files;

      const normalizedSearch = searchTerm.toLowerCase();
      return files.filter((file) =>
        file.name.toLowerCase().includes(normalizedSearch)
      );
    },
    [searchTerm]
  );

  const processFiles = useCallback(
    (files: FileItem[]) => {
      const filtered = filterFiles(files);
      return sortFiles(filtered);
    },
    [filterFiles, sortFiles]
  );

  const toggleSortDirection = useCallback(() => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    sortType,
    setSortType,
    sortDirection,
    toggleSortDirection,
    processFiles,
  };
}
