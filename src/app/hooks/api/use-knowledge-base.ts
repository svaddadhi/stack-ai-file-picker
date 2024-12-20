import useSWR from "swr";
import { apiClient } from "@/app/lib/api/client";
import { endpoints } from "@/app/lib/api/endpoint";

interface CreateKBParams {
  connectionId: string;
  connectionSourceIds: string[];
  name: string;
  description?: string;
}

export function useKnowledgeBase(kbId?: string) {
  const { data: orgData } = useSWR(endpoints.organization.current, (url) =>
    apiClient.fetchWithAuth(url)
  );

  const orgId = orgData?.org_id;

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

  const syncKnowledgeBase = async (knowledgeBaseId: string) => {
    if (!orgId) throw new Error("Organization ID not found");

    return apiClient.fetchWithAuth(
      endpoints.knowledgeBase.sync(knowledgeBaseId, orgId),
      { method: "GET" }
    );
  };

  const {
    data: resources,
    error,
    isLoading,
  } = useSWR(kbId ? endpoints.knowledgeBase.children(kbId) : null, (url) =>
    apiClient.fetchWithAuth(url)
  );

  return {
    resources,
    error,
    isLoading,
    createKnowledgeBase,
    syncKnowledgeBase,
  };
}
