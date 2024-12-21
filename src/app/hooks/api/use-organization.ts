// src/app/hooks/api/use-organization.ts
import useSWR from "swr";
import { apiClient } from "@/app/lib/api/client";
import { endpoints } from "@/app/lib/api/endpoint";

/**
 * Fetches the current user's organization info, returning org_id.
 */
export function useOrganization() {
  const { data, error, isLoading } = useSWR(
    endpoints.organization.current,
    (url) => apiClient.fetchWithAuth(url)
  );

  return {
    orgId: data?.org_id || null,
    error,
    isLoading,
  };
}
