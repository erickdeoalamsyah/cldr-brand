const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}


type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

async function request<T>(
  path: string,
  options: {
    method?: Method;
    token?: string | null;
    body?: any;
  } = {}
): Promise<T> {
  const { method = "GET", token, body } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    // credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

if (!res.ok) {
    const message = data?.message || `Request failed with status ${res.status}`;
    // JANGAN PAKAI new Error(message)
    // GUNAKAN ApiError agar properti .status bisa terbaca di cart.ts
    throw new ApiError(message, res.status); 
  }



  // T di sini biasanya ApiResponse<Something>
  return data as T;
}

export const api = {
  get:   <T>(path: string, token?: string | null) =>
    request<T>(path, { method: "GET", token }),
  post:  <T>(path: string, body: any, token?: string | null) =>
    request<T>(path, { method: "POST", body, token }),
  put:   <T>(path: string, body: any, token?: string | null) =>
    request<T>(path, { method: "PUT", body, token }),
    patch: <T>(path: string, body: any, token?: string | null) => request<T>(path, { method: "PATCH", body, token }),
  delete:<T>(path: string, token?: string | null) =>
    request<T>(path, { method: "DELETE", token }),
};
