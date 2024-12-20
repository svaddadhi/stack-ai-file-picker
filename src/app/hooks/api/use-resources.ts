import useSWR from "swr";
import { apiClient } from "@/app/lib/api/client";
import { endpoints } from "@/app/lib/api/endpoint";
import { FileItem } from "@/app/lib/types/file";

interface UseResourcesProps {
  connectionId: string;
  resourceId?: string;
}

export function useResources({ connectionId, resourceId }: UseResourcesProps) {
  const { data, error, isLoading, mutate } = useSWR<FileItem[]>(
    connectionId
      ? endpoints.connection.children(connectionId, resourceId)
      : null,
    (url: string) => apiClient.fetchWithAuth(url)
  );

  return {
    resources: data || [],
    error,
    isLoading,
    refreshResources: mutate,
  };
}
