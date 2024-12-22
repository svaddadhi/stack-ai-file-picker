import useSWR from "swr";
import { apiClient } from "@/app/lib/api/client";
import { endpoints } from "@/app/lib/api/endpoint";
import { useCallback } from "react";
import type { FileItem } from "@/app/lib/types/file";

interface CreateKBParams {
  connectionId: string;
  connectionSourceIds: string[];
  name: string;
  description?: string;
}

export function useKnowledgeBase() {
  const { data: orgData } = useSWR(endpoints.organization.current, (url) =>
    apiClient.fetchWithAuth(url)
  );
  const orgId = orgData?.org_id;

  // Create or update a KB with a set of resource IDs
  const createKnowledgeBase = async ({
    connectionId,
    connectionSourceIds,
    name,
    description,
  }: CreateKBParams) => {
    const response = await apiClient.fetchWithAuth(
      endpoints.knowledgeBase.create,
      {
        method: "POST",
        body: JSON.stringify({
          connection_id: connectionId,
          connection_source_ids: connectionSourceIds,
          name,
          description,
          indexing_params: {
            ocr: false,
            unstructured: true,
            embedding_params: {
              embedding_model: "text-embedding-ada-002",
              api_key: null,
            },
            chunker_params: {
              chunk_size: 1500,
              chunk_overlap: 500,
              chunker: "sentence",
            },
          },
        }),
      }
    );
    return response;
  };

  const deleteResourceFromKB = async (kbId: string, path: string) => {
    const url = `${endpoints.knowledgeBase.resources(
      kbId
    )}?resource_path=${encodeURIComponent(path)}`;
    return apiClient.fetchWithAuth(url, { method: "DELETE" });
  };

  const syncKnowledgeBase = async (knowledgeBaseId: string) => {
    if (!orgId) throw new Error("Organization ID not found");
    return apiClient.fetchWithAuth(
      endpoints.knowledgeBase.sync(knowledgeBaseId, orgId)
    );
  };

  const fetchKBChildren = useCallback(
    async (kbId: string, resourcePath: string) => {
      const pathEncoded = encodeURIComponent(resourcePath || "/");
      const endpoint = `/knowledge_bases/${kbId}/resources/children?resource_path=${pathEncoded}`;
      return apiClient.fetchWithAuth(endpoint);
    },
    []
  );

  return {
    createKnowledgeBase,
    deleteResourceFromKB,
    syncKnowledgeBase,
    fetchKBChildren,
    orgId,
  };
}

export function useKBChildren(kbId: string | undefined, resourcePath = "/") {
  const safeFetcher = useCallback(async (url: string) => {
    try {
      return await apiClient.fetchWithAuth(url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("does not exist") && msg.includes("Path error")) {
        console.warn(
          "[useKBChildren] 400 error: path does not exist. Returning []."
        );
        return [];
      }
      throw err;
    }
  }, []);

  const pathEncoded = encodeURIComponent(resourcePath || "/");
  const swrKey = kbId
    ? `/knowledge_bases/${kbId}/resources/children?resource_path=${pathEncoded}`
    : null;

  const { data, error, isLoading, mutate } = useSWR<FileItem[]>(
    swrKey,
    safeFetcher
  );

  return {
    kbResources: data || [],
    kbError: error,
    kbLoading: isLoading,
    refreshKB: mutate,
  };
}
