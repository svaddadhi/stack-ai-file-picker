import { AuthResponse } from "../types/api";

const API_URL = "https://api.stack-ai.com";

const AUTH_URL = "https://sb.stack-ai.com";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZic3VhZGZxaGtseG9rbWxodHNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzM0NTg5ODAsImV4cCI6MTk4OTAzNDk4MH0.Xjry9m7oc42_MsLRc1bZhTTzip3srDjJ6fJMkwhXQ9s";

class ApiClient {
  private static instance: ApiClient;
  private accessToken: string | null = null;

  private constructor() {}

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  async login(email: string, password: string): Promise<string> {
    console.log("[ApiClient] login called with email:", email);
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
      const errorText = await response.text();
      console.error("[ApiClient] Auth error:", errorText);
      throw new Error("Authentication failed");
    }

    const data: AuthResponse = await response.json();
    this.accessToken = data.access_token;
    console.log("[ApiClient] login successful, token set:", this.accessToken);
    return data.access_token;
  }

  async fetchWithAuth(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    console.log(
      "[ApiClient] fetchWithAuth - endpoint:",
      endpoint,
      "AccessToken:",
      this.accessToken
    );
    if (!this.accessToken) {
      console.warn("[ApiClient] Not authenticated, cannot fetch:", endpoint);
      throw new Error("Not authenticated");
    }

    const isGetRequest =
      !options.method || options.method.toUpperCase() === "GET";

    // Normalize headers to a plain Record<string, string>
    let originalHeaders: Record<string, string> = {};

    if (options.headers instanceof Headers) {
      // Convert Headers to a plain object
      originalHeaders = Object.fromEntries(options.headers.entries());
    } else if (options.headers && typeof options.headers === "object") {
      // If it's already a record or object, just cast it
      originalHeaders = options.headers as Record<string, string>;
    }

    const headers: Record<string, string> = {
      ...originalHeaders,
      Authorization: `Bearer ${this.accessToken}`,
    };

    // For GET requests, do not set Content-Type and do not send a body
    if (!isGetRequest) {
      headers["Content-Type"] = "application/json";
    } else {
      // Remove body if any was inadvertently passed for a GET request
      if (options.body) {
        console.log("[ApiClient] Removing body from GET request");
        delete options.body;
      }
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    console.log(
      "[ApiClient] fetchWithAuth - response status:",
      response.status
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ApiClient] API error (${response.status}):`, errorText);
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const jsonData = await response.json();
    console.log("[ApiClient] fetchWithAuth - response data:", jsonData);
    return jsonData;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    return this.accessToken !== null;
  }

  logout(): void {
    console.log("[ApiClient] logout called");
    this.accessToken = null;
  }
}

export const apiClient = ApiClient.getInstance();
