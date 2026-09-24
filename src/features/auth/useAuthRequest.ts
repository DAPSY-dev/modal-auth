import { useRef, useState } from 'react';
import { useAppDispatch } from '../../app/store';
import { getAuthError } from '../../services/authService';
import { setBusy } from './authSlice';

// One request lock also prevents Enter-key submissions before React re-renders.
export function useAuthRequest() {
  const dispatch = useAppDispatch();
  const pending = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  async function run(action: () => Promise<void>) {
    if (pending.current) return;
    pending.current = true;
    setError(null);
    setLoading(true);
    dispatch(setBusy(true));
    try {
      await action();
    } catch (error) {
      setError(getAuthError(error));
    } finally {
      pending.current = false;
      setLoading(false);
      dispatch(setBusy(false));
    }
  }
  return { run, error, setError, loading };
}
