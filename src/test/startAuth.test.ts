import { beforeEach, expect, it, vi } from 'vitest';
import { createAppStore } from '../app/store';
import { startAuth } from '../features/auth/startAuth';
import { authService, type SessionState } from '../services/authService';
import { getRememberedUser } from '../storage/rememberedUserStorage';

vi.mock('../services/supabase', () => ({ isSupabaseConfigured: true }));
vi.mock('../services/authService', () => ({
  authService: { subscribe: vi.fn(), getSession: vi.fn() },
  getAuthError: () => 'Connection failed',
}));
beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
});

it('keeps startup pending until the saved session is restored', async () => {
  let resolve!: (state: SessionState) => void;
  vi.mocked(authService.subscribe).mockReturnValue(() => {});
  vi.mocked(authService.getSession).mockReturnValue(
    new Promise((done) => {
      resolve = done;
    }),
  );
  const store = createAppStore();
  const stop = startAuth(store);
  expect(store.getState().auth.status).toBe('initializing');
  resolve({
    user: { id: '1', name: 'John', email: 'john@example.com' },
    recovery: false,
    invalidLink: false,
  });
  await Promise.resolve();
  expect(store.getState().auth.user?.name).toBe('John');
  expect(store.getState().auth.status).toBe('ready');
  expect(getRememberedUser()).toEqual({
    name: 'John',
    email: 'john@example.com',
  });
  expect(store.getState().auth.rememberedUser).toEqual(getRememberedUser());
  stop();
});

it('does not overwrite a recovery event with a stale startup response', async () => {
  let listener!: (state: SessionState) => void;
  let resolve!: (state: SessionState) => void;
  vi.mocked(authService.subscribe).mockImplementation((callback) => {
    listener = callback;
    return () => {};
  });
  vi.mocked(authService.getSession).mockReturnValue(
    new Promise((done) => {
      resolve = done;
    }),
  );
  const store = createAppStore();
  const stop = startAuth(store);
  listener({ user: null, recovery: true, invalidLink: false });
  resolve({ user: null, recovery: false, invalidLink: false });
  await Promise.resolve();
  expect(store.getState().auth.modal).toBe('resetPassword');
  expect(store.getState().auth.recovery).toBe(true);
  expect(getRememberedUser()).toBeNull();
  stop();
});

it('remembers an email-verification session after logout and a new page load', () => {
  let listener!: (state: SessionState) => void;
  vi.mocked(authService.subscribe).mockImplementation((callback) => {
    listener = callback;
    return () => {};
  });
  vi.mocked(authService.getSession).mockReturnValue(new Promise(() => {}));
  const store = createAppStore();
  const stop = startAuth(store);
  listener({
    user: { id: '1', name: 'John', email: 'john@example.com' },
    recovery: false,
    invalidLink: false,
  });
  listener({ user: null, recovery: false, invalidLink: false });
  expect(store.getState().auth.user).toBeNull();
  const identity = { name: 'John', email: 'john@example.com' };
  expect(store.getState().auth.rememberedUser).toEqual(identity);
  expect(getRememberedUser()).toEqual(identity);
  expect(createAppStore().getState().auth.rememberedUser).toEqual(identity);
  stop();
});
