import { apiRequest } from './client';
import { endpoints } from './config';

/** @param {string} token */
export async function fetchCurrentUser(token) {
  return apiRequest(endpoints.identity.me, { token });
}
