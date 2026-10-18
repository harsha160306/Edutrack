import { apiRequest } from './client';
import { endpoints } from './config';

/**
 * @param {string} token
 * @param {{
 *   student_emp_id: string,
 *   student_name?: string,
 *   marked_at?: string,
 *   notes?: string,
 *   idempotency_key?: string,
 * }} payload
 */
export async function createDressCodeMark(token, payload) {
  return apiRequest(endpoints.discipline.dressCodeMarks, {
    token,
    method: 'POST',
    body: payload,
  });
}

/** @param {string} token */
export async function fetchDisciplineFines(token) {
  const data = await apiRequest(endpoints.discipline.fines, { token });
  return Array.isArray(data) ? data : data?.results ?? [];
}

/** @param {string} token */
export async function fetchFineAppeals(token) {
  const data = await apiRequest(endpoints.discipline.appeals, { token });
  return Array.isArray(data) ? data : data?.results ?? [];
}
