import useSWR from "swr";
import { apiClient } from "@/app/lib/api/client";
import { endpoints } from "@/app/lib/api/endpoint";
import { Connection } from "@/app/lib/types/api";

export function useConnection() {
  console.log("[useConnection] Fetching connection list");
  const { data, error, isLoading } = useSWR<Connection[]>(
    endpoints.connection.list(),
    (url: string) => {
      console.log("[useConnection] SWR fetch:", url);
      return apiClient.fetchWithAuth(url);
    }
  );

  if (error) {
    console.error("[useConnection] Error fetching connections:", error);
  } else {
    console.log("[useConnection] Connection data:", data);
  }

  return {
    connection: data?.[0],
    error,
    isLoading,
  };
}
