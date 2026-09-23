import { beforeEach, expect, it, vi } from 'vitest';

const sdk = vi.hoisted(() => ({
  getSession: vi.fn(), signInWithPassword: vi.fn(), signUp: vi.fn(), signOut: vi.fn(),
  updateUser: vi.fn(), onAuthStateChange: vi.fn(), resetPasswordForEmail: vi.fn(),
}));
vi.mock('../services/supabase', () => ({ isSupabaseConfigured: true, getSupabase: () => ({ auth: sdk }) }));

const verifiedUser = { id: '1', email: 'john@example.com', email_confirmed_at: '2026-01-01', user_metadata: { name: 'John' } };

beforeEach(() => {
  vi.resetModules(); vi.resetAllMocks();
  sessionStorage.clear();
  window.history.replaceState(null, '', '/');
  sdk.signOut.mockResolvedValue({ error: null });
});

it('rejects an unverified user even if an SDK login returns a session', async () => {
  sdk.signInWithPassword.mockResolvedValue({ data: { user: { ...verifiedUser, email_confirmed_at: null } }, error: null });
  const { authService } = await import('../services/authService');
  await expect(authService.signIn('john@example.com', 'password')).rejects.toThrow('verify your email');
  expect(sdk.signOut).toHaveBeenCalledWith({ scope: 'local' });
});

it('keeps recovery anonymous across refresh, then permits normal login after sign-out', async () => {
  window.history.replaceState(null, '', '/#type=recovery');
  sdk.getSession.mockResolvedValue({ data: { session: { user: verifiedUser } }, error: null });
  let { authService } = await import('../services/authService');
  expect(await authService.getSession()).toEqual({ user: null, recovery: true, invalidLink: false });
  window.history.replaceState(null, '', '/');
  vi.resetModules();
  ({ authService } = await import('../services/authService'));
  expect((await authService.getSession()).recovery).toBe(true);
  await authService.signOut();
  expect((await authService.getSession()).user?.name).toBe('John');
});

it('detects expired callback links and clears the error after sign-out', async () => {
  window.history.replaceState(null, '', '/#error=access_denied&error_code=otp_expired');
  sdk.getSession.mockResolvedValue({ data: { session: null }, error: null });
  const { authService } = await import('../services/authService');
  expect((await authService.getSession()).invalidLink).toBe(true);
  expect(window.location.hash).toBe('');
  await authService.signOut();
  expect((await authService.getSession()).invalidLink).toBe(false);
});

it('rejects registration if email confirmation is disabled', async () => {
  sdk.signUp.mockResolvedValue({ data: { session: { user: verifiedUser } }, error: null });
  const { authService } = await import('../services/authService');
  await expect(authService.signUp('John', 'john@example.com', 'password')).rejects.toThrow('Email confirmation must be enabled');
  expect(sdk.signOut).toHaveBeenCalledOnce();
});

it('does not allow a password update without a recovery flow', async () => {
  const { authService } = await import('../services/authService');
  await expect(authService.updatePassword('new-password')).rejects.toThrow('valid password-reset link');
  expect(sdk.updateUser).not.toHaveBeenCalled();
});
