// src/hooks/useSupabase.js
import { useState, useEffect, useCallback } from 'react';

/**
 * Generic hook for Supabase queries.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useSupabase(
 *     () => getFacilities({ search: 'mukono' }),
 *     [search]          // re-run deps
 *   );
 */
export const useSupabase = (queryFn, deps = []) => {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: result, error: err } = await queryFn();
      if (err) throw err;
      setData(result);
    } catch (e) {
      setError(e.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { run(); }, [run]);

  return { data, loading, error, refetch: run };
};

/**
 * Hook specifically for auth-gated queries (skips if no user).
 */
export const useAuthQuery = (user, queryFn, deps = []) => {
  return useSupabase(
    user ? queryFn : () => Promise.resolve({ data: null, error: null }),
    [user?.id, ...deps],
  );
};
