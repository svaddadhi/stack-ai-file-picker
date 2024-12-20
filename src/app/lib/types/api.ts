export interface AuthResponse {
  access_token: string;
}

export interface Connection {
  connection_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  connection_provider: string;
}

export interface ApiError {
  message: string;
  status: number;
}
