// Centralized HTTP client used across the app.
// Enforces cookies on every request and notifies a global handler on 401s.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

type UnauthorizedHandler = () => void | Promise<void>;

let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  unauthorizedHandler = handler;
}

export class ApiError extends Error {
  status?: number;
  data?: unknown;
}

export type ApiFetchOptions = RequestInit & {
  skipAuthHandling?: boolean;
};

function buildUrl(path: string) {
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
}

function mergeHeaders(base?: HeadersInit, extra?: HeadersInit): Headers {
  const headers = new Headers(base);
  if (extra) {
    new Headers(extra).forEach((value, key) => {
      headers.set(key, value);
    });
  }
  return headers;
}

function parseBody(text: string) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { skipAuthHandling, headers, ...init } = options;

  const response = await fetch(buildUrl(path), {
    credentials: 'include',
    cache: 'no-store',
    headers: mergeHeaders({ 'Content-Type': 'application/json' }, headers),
    ...init,
    signal: init.signal,
  });

  const rawBody = await response.text();
  const data = parseBody(rawBody);

  if (response.status === 401 && !skipAuthHandling && unauthorizedHandler) {
    await unauthorizedHandler();
  }

  if (!response.ok) {
    const message =
      typeof data === 'string'
        ? data
        : (data as { message?: string })?.message || 'Error en la solicitud';
    const error = new ApiError(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data as T;
}

export { API_URL };
