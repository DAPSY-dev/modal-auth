import type { Session, User } from '@supabase/supabase-js';
import type { AuthUser } from '../features/auth/types';
import { getSupabase, isSupabaseConfigured } from './supabase';

const recoveryKey = 'modal-auth.recovery-pending';
const callback = new URLSearchParams(window.location.hash.slice(1));
let callbackFailed = callback.has('error') || new URLSearchParams(window.location.search).has('error');
let registrationPending = false;
let recoveryPending = callback.get('type') === 'recovery';
try { recoveryPending ||= sessionStorage.getItem(recoveryKey) === 'true'; } catch { /* In-memory fallback. */ }

function markRecovery(pending: boolean) {
  recoveryPending = pending;
  try {
    if (pending) sessionStorage.setItem(recoveryKey, 'true');
    else sessionStorage.removeItem(recoveryKey);
  } catch { /* No authentication data is stored here. */ }
}
if (recoveryPending) markRecovery(true);

function toUser(user: User | undefined): AuthUser | null {
  if (!user?.email_confirmed_at || !user.email) return null;
  const name = typeof user.user_metadata.name === 'string' ? user.user_metadata.name.trim() : '';
  return { id: user.id, email: user.email, name: name || user.email };
}

export interface SessionState {
  user: AuthUser | null;
  recovery: boolean;
  invalidLink: boolean;
}

function sessionState(session: Session | null): SessionState {
  return {
    user: recoveryPending || callbackFailed || registrationPending ? null : toUser(session?.user),
    recovery: recoveryPending && Boolean(session),
    invalidLink: callbackFailed || (recoveryPending && !session),
  };
}

export function getAuthError(error: unknown): string {
  if (!isSupabaseConfigured) return 'Authentication is not configured yet. Add the Supabase settings shown on the home page and restart the server.';
  const code = error && typeof error === 'object' && 'code' in error ? error.code : '';
  switch (code) {
    case 'invalid_credentials': return 'The email or password is incorrect. Please try again.';
    case 'email_not_confirmed': return 'Please verify your email before logging in.';
    case 'user_already_exists': case 'email_exists': return 'Unable to register with these details. Try logging in or resetting your password.';
    case 'weak_password': return 'Please choose a stronger password that meets the account password requirements.';
    case 'same_password': return 'Choose a password different from your current password.';
    case 'over_email_send_rate_limit': case 'over_request_rate_limit': return 'Too many requests. Please wait a few minutes and try again.';
    case 'session_not_found': case 'refresh_token_not_found': case 'otp_expired': return 'This session or link has expired. Please request a new password-reset email.';
  }
  if (error instanceof AuthFlowError) return error.message;
  return 'We could not complete your request. Check your connection and try again.';
}

class AuthFlowError extends Error {}

export const authService = {
  subscribe(onChange: (state: SessionState) => void) {
    const { data } = getSupabase().auth.onAuthStateChange((event, session) => {
      // Keep this callback synchronous: awaiting another auth call can deadlock the SDK.
      if (event === 'PASSWORD_RECOVERY') markRecovery(true);
      if (event === 'SIGNED_OUT') { markRecovery(false); callbackFailed = false; }
      onChange(sessionState(session));
    });
    return () => data.subscription.unsubscribe();
  },
  async getSession(): Promise<SessionState> {
    const { data, error } = await getSupabase().auth.getSession();
    if (error) throw error;
    if (callbackFailed) window.history.replaceState(null, '', window.location.pathname);
    return sessionState(data.session);
  },
  async signIn(email: string, password: string): Promise<AuthUser> {
    const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
    if (error) throw error;
    const user = toUser(data.user);
    if (!user) {
      await authService.signOut();
      throw new AuthFlowError('Please verify your email before logging in.');
    }
    markRecovery(false);
    callbackFailed = false;
    return user;
  },
  async signUp(name: string, email: string, password: string) {
    registrationPending = true;
    try {
      const { data, error } = await getSupabase().auth.signUp({
        email, password,
        options: { data: { name }, emailRedirectTo: window.location.origin + '/' },
      });
      if (error) throw error;
      if (data.session) {
        await authService.signOut();
        throw new AuthFlowError('Email confirmation must be enabled in Supabase before registration can be used.');
      }
      // Supabase may deliberately return an obfuscated user for an existing address.
    } finally { registrationPending = false; }
  },
  async signOut() {
    const { error } = await getSupabase().auth.signOut({ scope: 'local' });
    if (error) throw error;
    markRecovery(false);
    callbackFailed = false;
  },
  async requestPasswordReset(email: string) {
    const { error } = await getSupabase().auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/',
    });
    if (error) throw error;
  },
  async updatePassword(password: string) {
    if (!recoveryPending) throw new AuthFlowError('Please open a valid password-reset link first.');
    const { data, error: sessionError } = await getSupabase().auth.getSession();
    if (sessionError) throw sessionError;
    if (!data.session) throw new AuthFlowError('Your reset link has expired. Please request a new one.');
    const { error } = await getSupabase().auth.updateUser({ password });
    if (error) throw error;
  },
};
