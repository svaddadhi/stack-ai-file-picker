import useSWR from "swr";
import { apiClient } from "@/app/lib/api/client";
import { endpoints } from "@/app/lib/api/endpoint";
import { FileItem } from "@/app/lib/types/file";

interface UseResourcesProps {
  connectionId: string;
  resourceId?: string;
}

export function useResources({ connectionId, resourceId }: UseResourcesProps) {
  if (!connectionId) {
    console.log("[useResources] No connectionId provided");
  } else {
    console.log(
      "[useResources] Using connectionId:",
      connectionId,
      "resourceId:",
      resourceId
    );
  }

  const url = connectionId
    ? endpoints.connection.children(connectionId, resourceId)
    : null;

  const { data, error, isLoading, mutate } = useSWR<FileItem[]>(
    url,
    (url: string) => {
      console.log("[useResources] SWR fetch:", url);
      // Just a GET request with no body is made here
      return apiClient.fetchWithAuth(url);
    }
  );

  if (error) {
    console.error("[useResources] Error fetching resources:", error);
  } else {
    console.log("[useResources] Fetched resources:", data);
  }

  return {
    resources: data || [],
    error,
    isLoading,
    refreshResources: mutate,
  };
}
