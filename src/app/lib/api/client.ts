import { AuthResponse } from "../types/api";

const API_URL = "https://api.stack-ai.com";
const AUTH_URL = "https://sb.stack-ai.com";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZic3VhZGZxaGtseG9rbWxodHNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzM0NTg5ODAsImV4cCI6MTk4OTAzNDk4MH0.Xjry9m7oc42_MsLRc1bZhTTzip3srDjJ6fJMkwhXQ9s";

class ApiClient {
  private accessToken: string | null = null;

  async login(email: string, password: string): Promise<string> {
    const response = await fetch(
      `${AUTH_URL}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ApiKey: ANON_KEY,
        },
        body: JSON.stringify({
          email,
          password,
          gotrue_meta_security: {},
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Authentication failed");
    }

    const data: AuthResponse = await response.json();
    this.accessToken = data.access_token;
    return data.access_token;
  }

  async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    if (!this.accessToken) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();
