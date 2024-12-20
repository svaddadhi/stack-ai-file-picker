import useSWR from "swr";
import { apiClient } from "@/app/lib/api/client";
import { endpoints } from "@/app/lib/api/endpoint";
import { Connection } from "@/app/lib/types/api";

export function useConnection() {
  const { data, error, isLoading } = useSWR<Connection[]>(
    endpoints.connection.list(),
    (url: string) => apiClient.fetchWithAuth(url)
  );

  return {
    connection: data?.[0],
    error,
    isLoading,
  };
}
