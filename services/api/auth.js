import { apiRequest } from './client';
import { endpoints } from './config';

/**
 * @param {{ login: string, password: string }} credentials
 */
export async function loginWithPassword(credentials) {
  return apiRequest(endpoints.auth.login, {
    method: 'POST',
    body: {
      login: credentials.login,
      password: credentials.password,
    },
    skipAuth: true,
  });
}

/**
 * @param {string} refreshToken
 */
export async function refreshAccessToken(refreshToken) {
  return apiRequest(endpoints.auth.refresh, {
    method: 'POST',
    body: { refresh: refreshToken },
    skipAuth: true,
  });
}
