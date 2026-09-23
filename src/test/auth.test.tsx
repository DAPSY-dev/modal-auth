import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { App } from '../App';
import { createAppStore } from '../app/store';
import { sessionReceived } from '../features/auth/authSlice';
import { authService } from '../services/authService';
import { getRememberedUser, setRememberedUser } from '../storage/rememberedUserStorage';

vi.mock('../services/supabase', () => ({ isSupabaseConfigured: true }));

vi.mock('../services/authService', async (original) => ({
  ...await original<typeof import('../services/authService')>(),
  authService: { signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn(), requestPasswordReset: vi.fn(), updatePassword: vi.fn() },
}));

const john = { id: 'user-1', name: 'John', email: 'john@example.com' };

function setup(recovery = false) {
  const store = createAppStore();
  store.dispatch(sessionReceived({ user: null, recovery, invalidLink: false }));
  render(<Provider store={store}><App /></Provider>);
  return { store, user: userEvent.setup() };
}

async function openLogin(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Log in' }));
  return within(screen.getByRole('dialog'));
}

beforeEach(() => { localStorage.clear(); vi.resetAllMocks(); });

describe('authentication dialogs', () => {
  it('shows standard login, navigation, and restores focus on close', async () => {
    const { user } = setup();
    const dialog = await openLogin(user);
    expect(dialog.getByLabelText('Email')).toBeRequired();
    await user.click(dialog.getByRole('button', { name: 'Forgot password?' }));
    expect(dialog.getByRole('heading', { name: 'Forgot password?' })).toHaveFocus();
    await user.type(dialog.getByLabelText('Email'), john.email);
    await user.click(dialog.getByRole('button', { name: 'Send reset instructions' }));
    expect(await dialog.findByRole('heading', { name: 'Check your email' })).toBeInTheDocument();
    expect(dialog.getByRole('status')).toHaveTextContent('If an account exists');
    await user.click(dialog.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log in' })).toHaveFocus();
  });

  it('logs in, remembers only identity, logs out, and offers password-only login', async () => {
    vi.mocked(authService.signIn).mockResolvedValue(john);
    const { user } = setup();
    let dialog = await openLogin(user);
    await user.type(dialog.getByLabelText('Email'), john.email);
    await user.type(dialog.getByLabelText('Password'), 'test-password');
    await user.click(dialog.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByRole('heading', { name: 'Welcome, John' })).toBeInTheDocument();
    expect(getRememberedUser()).toEqual({ email: john.email, name: john.name });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Log out' }));
    expect(authService.signOut).toHaveBeenCalledOnce();
    expect(await screen.findByRole('heading', { name: 'Welcome to our site' })).toBeInTheDocument();
    dialog = await openLogin(user);
    expect(dialog.getByRole('heading')).toHaveTextContent('Welcome back, John');
    expect(dialog.queryByLabelText('Email')).not.toBeInTheDocument();
    await user.type(dialog.getByLabelText('Password'), 'another-password');
    await user.click(dialog.getByRole('button', { name: 'Log in' }));
    expect(authService.signIn).toHaveBeenLastCalledWith(john.email, 'another-password');
  });

  it('clears the remembered preference with Not you?', async () => {
    setRememberedUser(john);
    const { user } = setup();
    const dialog = await openLogin(user);
    await user.click(dialog.getByRole('button', { name: 'Not you?' }));
    expect(dialog.getByLabelText('Email')).toHaveValue('');
    expect(dialog.getByLabelText('Password')).toHaveValue('');
    expect(getRememberedUser()).toBeNull();
  });

  it('shows useful login errors and prevents duplicate requests', async () => {
    let rejectLogin!: (error: unknown) => void;
    vi.mocked(authService.signIn).mockImplementation(() => new Promise((_, reject) => { rejectLogin = reject; }));
    const { user } = setup();
    const dialog = await openLogin(user);
    await user.type(dialog.getByLabelText('Email'), john.email);
    await user.type(dialog.getByLabelText('Password'), 'wrong-password');
    await user.click(dialog.getByRole('button', { name: 'Log in' }));
    expect(dialog.getByRole('button', { name: 'Logging in…' })).toBeDisabled();
    expect(dialog.getByRole('button', { name: 'Close' })).toBeDisabled();
    fireEvent.submit(dialog.getByRole('form'));
    expect(authService.signIn).toHaveBeenCalledOnce();
    await act(async () => rejectLogin({ code: 'invalid_credentials' }));
    expect(await dialog.findByRole('alert')).toHaveTextContent('email or password is incorrect');
    expect(dialog.getByRole('button', { name: 'Log in' })).toBeEnabled();
  });

  it('shows registration success without authenticating the user', async () => {
    const { user } = setup();
    const dialog = await openLogin(user);
    await user.click(dialog.getByRole('button', { name: 'Register' }));
    await user.type(dialog.getByLabelText('Name'), 'John');
    await user.type(dialog.getByLabelText('Email'), john.email);
    await user.type(dialog.getByLabelText('Password'), 'test-password');
    await user.click(dialog.getByRole('button', { name: 'Create account' }));
    expect(authService.signUp).toHaveBeenCalledWith('John', john.email, 'test-password');
    expect(await dialog.findByRole('heading', { name: 'Registration successful' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Welcome to our site' })).toBeInTheDocument();
    expect(dialog.getByRole('status')).toHaveTextContent('verify your account');
  });

  it('requires matching reset passwords, signs out, and returns to login', async () => {
    const { user, store } = setup(true);
    const dialog = within(screen.getByRole('dialog'));
    await user.type(dialog.getByLabelText('New password'), 'new-password');
    await user.type(dialog.getByLabelText('Confirm new password'), 'different-password');
    await user.click(dialog.getByRole('button', { name: 'Save new password' }));
    expect(dialog.getByRole('alert')).toHaveTextContent('do not match');
    expect(authService.updatePassword).not.toHaveBeenCalled();
    await user.clear(dialog.getByLabelText('Confirm new password'));
    await user.type(dialog.getByLabelText('Confirm new password'), 'new-password');
    await user.click(dialog.getByRole('button', { name: 'Save new password' }));
    expect(await dialog.findByRole('heading', { name: 'Password updated' })).toBeInTheDocument();
    expect(authService.updatePassword).toHaveBeenCalledWith('new-password');
    expect(authService.signOut).toHaveBeenCalledOnce();
    expect(store.getState().auth.user).toBeNull();
    await user.click(dialog.getByRole('button', { name: 'Back to login' }));
    expect(dialog.getByLabelText('Password')).toBeInTheDocument();
  });

  it('retries a failed reset sign-out without changing the password twice', async () => {
    vi.mocked(authService.signOut).mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce(undefined);
    const { user } = setup(true);
    const dialog = within(screen.getByRole('dialog'));
    await user.type(dialog.getByLabelText('New password'), 'new-password');
    await user.type(dialog.getByLabelText('Confirm new password'), 'new-password');
    await user.click(dialog.getByRole('button', { name: 'Save new password' }));
    expect(await dialog.findByRole('alert')).toHaveTextContent('Check your connection');
    await user.click(dialog.getByRole('button', { name: 'Finish signing out' }));
    await waitFor(() => expect(dialog.getByRole('heading')).toHaveTextContent('Password updated'));
    expect(authService.updatePassword).toHaveBeenCalledOnce();
    expect(authService.signOut).toHaveBeenCalledTimes(2);
  });

  it('cleans up a recovery session when the dialog is cancelled', async () => {
    const { user, store } = setup(true);
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(authService.signOut).toHaveBeenCalledOnce();
    expect(store.getState().auth.recovery).toBe(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

