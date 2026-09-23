import type { AppStore } from '../../app/store';
import { authService, getAuthError, type SessionState } from '../../services/authService';
import { isSupabaseConfigured } from '../../services/supabase';
import { sessionReceived, startupFailed } from './authSlice';

export function startAuth(store: AppStore) {
  if (!isSupabaseConfigured) {
    store.dispatch(startupFailed('Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local, then restart the development server.'));
    return () => {};
  }
  let active = true;
  let version = 0;
  let unsubscribe = () => {};
  const receive = (state: SessionState) => {
    if (active) { version++; store.dispatch(sessionReceived(state)); }
  };
  try {
    unsubscribe = authService.subscribe(receive);
    const requestedVersion = version;
    void authService.getSession().then((state) => {
      if (version === requestedVersion) receive(state);
    }).catch((error: unknown) => {
      if (active && version === requestedVersion) store.dispatch(startupFailed(getAuthError(error)));
    });
  } catch (error) { store.dispatch(startupFailed(getAuthError(error))); }
  return () => { active = false; unsubscribe(); };
}
