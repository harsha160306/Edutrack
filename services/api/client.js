import { API_BASE_URL } from './config';

export class ApiError extends Error {
  /** @param {string} message @param {number} status @param {unknown} [body] */
  constructor(message, status, body) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

function parseErrorMessage(body, fallback) {
  if (!body || typeof body !== 'object') return fallback;
  if (typeof body.detail === 'string') return body.detail;
  const firstKey = Object.keys(body)[0];
  const value = firstKey ? body[firstKey] : null;
  if (Array.isArray(value) && value[0]) return String(value[0]);
  if (typeof value === 'string') return value;
  return fallback;
}

/**
 * @param {string} path
 * @param {{ token?: string | null, method?: string, body?: unknown, skipAuth?: boolean }} [options]
 */
export async function apiRequest(path, options = {}) {
  const { token, method = 'GET', body, skipAuth = false } = options;
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && !skipAuth ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    throw new ApiError(parseErrorMessage(data, response.statusText), response.status, data);
  }

  return data;
}
