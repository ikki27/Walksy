import { fetch } from 'expo/fetch';

import { API_URL } from '../config/api';

// Every request to our backend goes through here: base URL, JSON, login token, errors.

export class ApiError extends Error {
  // code: what the backend sent ({ code }), or 'network' / 'unavailable'
  constructor(
    public readonly code: string,
    public readonly status: number,
  ) {
    super(code);
  }
}

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

// called when the backend says the token is no longer valid (expired, account deleted)
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

export function authHeaders(): Record<string, string> {
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
};

// raw response, for streaming (the assistant chat); errors are already handled
export async function apiFetch(path: string, { method = 'GET', body, signal }: RequestOptions = {}) {
  let response: Awaited<ReturnType<typeof fetch>>;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ApiError('network', 0);
  }

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { code?: unknown } | null;
    const code = typeof data?.code === 'string' ? data.code : response.status === 400 ? 'invalid_input' : 'unavailable';
    if (response.status === 401 && authToken) onUnauthorized?.();
    throw new ApiError(code, response.status);
  }

  return response;
}

// JSON request → parsed JSON response
export async function apiRequest<T>(path: string, options?: RequestOptions): Promise<T> {
  const response = await apiFetch(path, options);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
