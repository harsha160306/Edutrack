import { apiRequest } from './client';
import { endpoints } from './config';

/**
 * @param {string} token
 * @param {{
 *   student_emp_id: string,
 *   student_name?: string,
 *   marked_at: string,
 *   notes?: string,
 *   idempotency_key?: string,
 * }} payload
 */
export async function createLatecomerMark(token, payload) {
  return apiRequest(endpoints.latecomers.marks, {
    token,
    method: 'POST',
    body: payload,
  });
}
