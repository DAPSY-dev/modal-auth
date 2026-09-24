import { beforeEach, expect, it, vi } from 'vitest';

const sdk = vi.hoisted(() => ({
  getSession: vi.fn(),
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  updateUser: vi.fn(),
  onAuthStateChange: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  setSession: vi.fn(),
  invoke: vi.fn(),
  rpc: vi.fn(),
}));
vi.mock('../services/supabase', () => ({
  isSupabaseConfigured: true,
  getSupabase: () => ({
    auth: sdk,
    functions: { invoke: sdk.invoke },
    rpc: sdk.rpc,
  }),
}));

const verifiedUser = {
  id: '1',
  email: 'john@example.com',
  email_confirmed_at: '2026-01-01',
  user_metadata: { name: 'John' },
};

it('changes a verified signed-in user password without signing out', async () => {
  sdk.getSession.mockResolvedValue({
    data: { session: { user: verifiedUser } },
    error: null,
  });
  sdk.updateUser.mockResolvedValue({ error: null });
  const { authService } = await import('../services/authService');
  await authService.changePassword('old-password', 'new-password');
  expect(sdk.updateUser).toHaveBeenCalledWith({
    password: 'new-password',
    current_password: 'old-password',
  });
  expect(sdk.signOut).not.toHaveBeenCalled();
});

it.each(['signed-out', 'recovery'])(
  'rejects account password changes during %s',
  async (mode) => {
    if (mode === 'recovery')
      sessionStorage.setItem('modal-auth.recovery-pending', 'true');
    sdk.getSession.mockResolvedValue({
      data: { session: mode === 'recovery' ? { user: verifiedUser } : null },
      error: null,
    });
    const { authService } = await import('../services/authService');
    await expect(
      authService.changePassword('old-password', 'new-password'),
    ).rejects.toThrow('Please log in');
    expect(sdk.updateUser).not.toHaveBeenCalled();
  },
);

beforeEach(() => {
  vi.resetModules();
  vi.resetAllMocks();
  sessionStorage.clear();
  window.history.replaceState(null, '', '/');
  sdk.signOut.mockResolvedValue({ error: null });
  sdk.rpc.mockResolvedValue({ data: true, error: null });
});

it('rejects an unverified user even if an SDK login returns a session', async () => {
  sdk.signInWithPassword.mockResolvedValue({
    data: { user: { ...verifiedUser, email_confirmed_at: null } },
    error: null,
  });
  const { authService } = await import('../services/authService');
  await expect(
    authService.signIn('john@example.com', 'password'),
  ).rejects.toThrow('verify your email');
  expect(sdk.signOut).toHaveBeenCalledWith({ scope: 'local' });
});

it('keeps recovery anonymous across refresh, then permits normal login after sign-out', async () => {
  window.history.replaceState(null, '', '/#type=recovery');
  sdk.getSession.mockResolvedValue({
    data: { session: { user: verifiedUser } },
    error: null,
  });
  let { authService } = await import('../services/authService');
  expect(await authService.getSession()).toEqual({
    user: null,
    recovery: true,
    invalidLink: false,
  });
  window.history.replaceState(null, '', '/');
  vi.resetModules();
  ({ authService } = await import('../services/authService'));
  expect((await authService.getSession()).recovery).toBe(true);
  await authService.signOut();
  expect((await authService.getSession()).user?.name).toBe('John');
});

it('detects expired callback links and clears the error after sign-out', async () => {
  window.history.replaceState(
    null,
    '',
    '/#error=access_denied&error_code=otp_expired',
  );
  sdk.getSession.mockResolvedValue({ data: { session: null }, error: null });
  const { authService } = await import('../services/authService');
  expect((await authService.getSession()).invalidLink).toBe(true);
  expect(window.location.hash).toBe('');
  await authService.signOut();
  expect((await authService.getSession()).invalidLink).toBe(false);
});

it('rejects registration if email confirmation is disabled', async () => {
  sdk.signUp.mockResolvedValue({
    data: { session: { user: verifiedUser } },
    error: null,
  });
  const { authService } = await import('../services/authService');
  await expect(
    authService.signUp('John', 'john_doe', 'john@example.com', 'password'),
  ).rejects.toThrow('Email confirmation must be enabled');
  expect(sdk.signOut).toHaveBeenCalledOnce();
});

it('does not allow a password update without a recovery flow', async () => {
  const { authService } = await import('../services/authService');
  await expect(authService.updatePassword('new-password')).rejects.toThrow(
    'valid password-reset link',
  );
  expect(sdk.updateUser).not.toHaveBeenCalled();
});

it('normalizes username login and gives session tokens only to the Supabase SDK', async () => {
  sdk.invoke.mockResolvedValue({
    data: { access_token: 'test-access', refresh_token: 'test-refresh' },
    error: null,
  });
  sdk.setSession.mockResolvedValue({
    data: { user: verifiedUser },
    error: null,
  });
  const { authService } = await import('../services/authService');
  expect(await authService.signIn(' John_Doe ', 'password')).toEqual({
    id: '1',
    email: verifiedUser.email,
    name: 'John',
  });
  expect(sdk.invoke).toHaveBeenCalledWith('username-login', {
    body: { username: 'john_doe', password: 'password' },
  });
  expect(sdk.setSession).toHaveBeenCalledWith({
    access_token: 'test-access',
    refresh_token: 'test-refresh',
  });
  expect(sdk.signInWithPassword).not.toHaveBeenCalled();
});

it('keeps direct email login working without the username function', async () => {
  sdk.signInWithPassword.mockResolvedValue({
    data: { user: verifiedUser },
    error: null,
  });
  const { authService } = await import('../services/authService');
  await authService.signIn(' john@example.com ', 'password');
  expect(sdk.signInWithPassword).toHaveBeenCalledWith({
    email: 'john@example.com',
    password: 'password',
  });
  expect(sdk.invoke).not.toHaveBeenCalled();
});

it('maps username login rejection without establishing a session', async () => {
  sdk.invoke.mockResolvedValue({
    data: null,
    error: {
      context: Response.json({ code: 'invalid_credentials' }, { status: 400 }),
    },
  });
  const { authService } = await import('../services/authService');
  await expect(authService.signIn('john_doe', 'wrong')).rejects.toEqual({
    code: 'invalid_credentials',
  });
  expect(sdk.setSession).not.toHaveBeenCalled();
});

it('stores normalized usernames in signup metadata', async () => {
  sdk.signUp.mockResolvedValue({ data: { session: null }, error: null });
  const { authService } = await import('../services/authService');
  await authService.signUp(
    'John',
    ' John_Doe ',
    'john@example.com',
    'password',
  );
  expect(sdk.rpc).toHaveBeenCalledWith('is_username_available', {
    requested_username: 'john_doe',
  });
  expect(sdk.signUp).toHaveBeenCalledWith(
    expect.objectContaining({
      options: expect.objectContaining({
        data: { name: 'John', username: 'john_doe' },
      }),
    }),
  );
});

it('rejects taken usernames before signup and handles a concurrent reservation', async () => {
  sdk.rpc.mockResolvedValueOnce({ data: false, error: null });
  const { authService, UsernameUnavailableError } =
    await import('../services/authService');
  await expect(
    authService.signUp('John', 'john_doe', 'john@example.com', 'password'),
  ).rejects.toBeInstanceOf(UsernameUnavailableError);
  expect(sdk.signUp).not.toHaveBeenCalled();
  sdk.rpc
    .mockResolvedValueOnce({ data: true, error: null })
    .mockResolvedValueOnce({ data: false, error: null });
  sdk.signUp.mockResolvedValue({
    data: {},
    error: { code: 'unexpected_failure' },
  });
  await expect(
    authService.signUp('John', 'john_doe', 'john@example.com', 'password'),
  ).rejects.toBeInstanceOf(UsernameUnavailableError);
});
