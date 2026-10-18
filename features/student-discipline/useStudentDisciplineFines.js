import { useCallback, useEffect, useState } from 'react';
import { fetchDisciplineFines } from '../../services/api/discipline';
import { getAccessToken } from '../../security/session';

/**
 * Student discipline fines from the platform API.
 */
export function useStudentDisciplineFines(enabled = true) {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setFines([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        setFines([]);
        return;
      }
      setFines(await fetchDisciplineFines(token));
    } catch (err) {
      setError(err?.message ?? 'Could not load fines');
      setFines([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { fines, loading, error, refresh };
}
