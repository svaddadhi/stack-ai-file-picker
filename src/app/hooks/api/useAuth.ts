import { useState, useCallback } from "react";
import { apiClient } from "@/app/lib/api/client";

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    console.log("[useAuth] Attempting login with email:", email);
    try {
      await apiClient.login(email, password);
      console.log(
        "[useAuth] Login successful. AccessToken:",
        apiClient.getAccessToken()
      );
    } catch (err) {
      console.error("[useAuth] Login error:", err);
      setError(err instanceof Error ? err.message : "Authentication failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    console.log("[useAuth] Logging out");
    apiClient.logout();
  }, []);

  const isAuthenticated = apiClient.isAuthenticated();
  console.log(
    "[useAuth] isAuthenticated:",
    isAuthenticated,
    "AccessToken:",
    apiClient.getAccessToken()
  );

  return {
    login,
    logout,
    isLoading,
    error,
    isAuthenticated,
  };
}
