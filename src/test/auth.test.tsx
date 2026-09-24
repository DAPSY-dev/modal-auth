import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { App } from '../App';
import { createAppStore } from '../app/store';
import { sessionReceived } from '../features/auth/authSlice';
import { authService, UsernameUnavailableError } from '../services/authService';
import { getRememberedUser, setRememberedUser } from '../storage/rememberedUserStorage';

vi.mock('../services/supabase', () => ({ isSupabaseConfigured: true }));

vi.mock('../services/authService', async (original) => ({
  ...await original<typeof import('../services/authService')>(),
  authService: { signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn(), requestPasswordReset: vi.fn(), updatePassword: vi.fn(), changePassword: vi.fn() },
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
  it('changes a signed-in user password with field validation and preserves their session', async () => {
    const { user, store } = setup();
    expect(screen.queryByRole('button', { name: 'Change password' })).not.toBeInTheDocument();
    act(() => { store.dispatch(sessionReceived({ user: john, recovery: false, invalidLink: false })); });
    await user.click(screen.getByRole('button', { name: 'Change password' }));
    const dialog = within(screen.getByRole('dialog'));
    await user.click(dialog.getByRole('button', { name: 'Save new password' }));
    expect(dialog.getByRole('form')).toHaveAttribute('novalidate');
    expect(dialog.getByLabelText('New password')).toHaveAccessibleDescription('Please enter a new password.');
    expect(dialog.getByLabelText('Confirm new password')).toHaveAccessibleDescription('Please confirm your new password.');
    expect(authService.changePassword).not.toHaveBeenCalled();
    expect(dialog.getByLabelText('Old password')).toHaveAccessibleDescription('Please enter your old password.');
    expect(dialog.getByLabelText('Old password')).toHaveFocus();
    await user.type(dialog.getByLabelText('Old password'), 'old-password');
    await user.type(dialog.getByLabelText('New password'), 'new-password');
    await user.type(dialog.getByLabelText('Confirm new password'), 'new-password');
    vi.mocked(authService.changePassword).mockRejectedValueOnce({ code: 'current_password_invalid' });
    await user.click(dialog.getByRole('button', { name: 'Save new password' }));
    expect(dialog.getByLabelText('Old password')).toHaveAccessibleDescription('Your old password is incorrect. Please try again.');
    await user.clear(dialog.getByLabelText('Old password'));
    await user.type(dialog.getByLabelText('Old password'), 'correct-password');
    vi.mocked(authService.changePassword).mockRejectedValueOnce({ code: 'same_password' });
    await user.click(dialog.getByRole('button', { name: 'Save new password' }));
    expect(await dialog.findByRole('alert')).toHaveTextContent('different from your current password');
    await user.click(dialog.getByRole('button', { name: 'Save new password' }));
    expect(await dialog.findByRole('heading', { name: 'Password changed' })).toBeInTheDocument();
    expect(authService.changePassword).toHaveBeenLastCalledWith('correct-password', 'new-password');
    expect(authService.signOut).not.toHaveBeenCalled();
    expect(store.getState().auth.user).toEqual(john);
  });
  it('accepts a username as a login identifier', async () => {
    vi.mocked(authService.signIn).mockResolvedValue(john);
    const { user } = setup();
    const dialog = await openLogin(user);
    await user.type(dialog.getByLabelText('Username or email'), 'John_Doe');
    await user.type(dialog.getByLabelText('Password'), 'test-password');
    await user.click(dialog.getByRole('button', { name: 'Log in' }));
    expect(authService.signIn).toHaveBeenCalledWith('John_Doe', 'test-password');
    expect(await screen.findByRole('heading', { name: 'Welcome, John' })).toBeInTheDocument();
  });

  it('validates username format and shows a taken username error at the field', async () => {
    vi.mocked(authService.signUp).mockRejectedValue(new UsernameUnavailableError());
    const { user } = setup();
    const dialog = await openLogin(user);
    await user.click(dialog.getByRole('button', { name: 'Register' }));
    await user.type(dialog.getByLabelText('Name'), 'John');
    await user.type(dialog.getByLabelText('Username'), 'bad name');
    await user.type(dialog.getByLabelText('Email'), john.email);
    await user.type(dialog.getByLabelText('Password'), 'test-password');
    await user.click(dialog.getByRole('button', { name: 'Create account' }));
    expect(dialog.getByLabelText('Username')).toHaveAttribute('aria-invalid', 'true');
    expect(authService.signUp).not.toHaveBeenCalled();
    await user.clear(dialog.getByLabelText('Username'));
    await user.type(dialog.getByLabelText('Username'), 'john_doe');
    await user.click(dialog.getByRole('button', { name: 'Create account' }));
    expect(await dialog.findByRole('alert')).toHaveTextContent('username is already taken');
    expect(dialog.getByLabelText('Username')).toHaveFocus();
    await user.type(dialog.getByLabelText('Username'), '2');
    expect(dialog.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('validates login fields without native validation and clears errors as fields are corrected', async () => {
    const { user } = setup();
    const dialog = await openLogin(user);
    expect(dialog.getByRole('form')).toHaveAttribute('novalidate');
    await user.click(dialog.getByRole('button', { name: 'Log in' }));
    const email = dialog.getByLabelText(/^(Username or email|Email)$/);
    const password = dialog.getByLabelText('Password');
    expect(email).toHaveAccessibleDescription('Please enter your username or email.');
    expect(password).toHaveAccessibleDescription('Please enter your password.');
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveFocus();
    expect(authService.signIn).not.toHaveBeenCalled();
    await user.type(email, 'invalid@');
    expect(email).toHaveAccessibleDescription('Please enter a valid email address.');
    await user.clear(email);
    await user.type(email, john.email);
    expect(email).not.toHaveAttribute('aria-invalid');
    await user.type(password, 'short');
    expect(password).not.toHaveAttribute('aria-invalid');
    // Existing accounts can have passwords shorter than today's registration policy.
    vi.mocked(authService.signIn).mockResolvedValue(john);
    await user.click(dialog.getByRole('button', { name: 'Log in' }));
    expect(authService.signIn).toHaveBeenCalledWith(john.email, 'short');
  });

  it('validates name, email, and password independently during registration', async () => {
    const { user } = setup();
    const dialog = await openLogin(user);
    await user.click(dialog.getByRole('button', { name: 'Register' }));
    expect(dialog.queryByRole('alert')).not.toBeInTheDocument();
    await user.type(dialog.getByLabelText('Name'), '   ');
    await user.tab();
    expect(dialog.getByLabelText('Name')).toHaveAccessibleDescription('Please enter your name.');
    await user.type(dialog.getByLabelText(/^(Username or email|Email)$/), 'invalid');
    await user.type(dialog.getByLabelText('Password'), 'short');
    await user.click(dialog.getByRole('button', { name: 'Create account' }));
    expect(dialog.getByRole('form')).toHaveAttribute('novalidate');
    expect(dialog.getAllByRole('alert')).toHaveLength(4);
    expect(dialog.getByLabelText('Username')).toHaveAccessibleDescription(expect.stringContaining('Please enter a username.'));
    expect(dialog.getByLabelText(/^(Username or email|Email)$/)).toHaveAccessibleDescription('Please enter a valid email address.');
    expect(dialog.getByLabelText('Password')).toHaveAccessibleDescription('Use at least 8 characters. Use at least 8 characters for your password.');
    expect(authService.signUp).not.toHaveBeenCalled();
    expect(dialog.getByLabelText('Name')).toHaveFocus();
  });

  it('validates the recovery email before requesting an email', async () => {
    const { user } = setup();
    const dialog = await openLogin(user);
    await user.click(dialog.getByRole('button', { name: 'Forgot password?' }));
    await user.click(dialog.getByRole('button', { name: 'Send reset instructions' }));
    expect(dialog.getByLabelText(/^(Username or email|Email)$/)).toHaveAccessibleDescription('Please enter your email.');
    await user.type(dialog.getByLabelText(/^(Username or email|Email)$/), 'wrong@');
    await user.click(dialog.getByRole('button', { name: 'Send reset instructions' }));
    expect(dialog.getByLabelText(/^(Username or email|Email)$/)).toHaveAccessibleDescription('Please enter a valid email address.');
    expect(dialog.getByRole('form')).toHaveAttribute('novalidate');
    expect(authService.requestPasswordReset).not.toHaveBeenCalled();
  });

  it('validates only the password for a remembered user', async () => {
    setRememberedUser(john);
    const { user } = setup();
    const dialog = await openLogin(user);
    await user.click(dialog.getByRole('button', { name: 'Log in' }));
    expect(dialog.getByLabelText('Password')).toHaveAccessibleDescription('Please enter your password.');
    expect(dialog.getByLabelText('Password')).toHaveFocus();
    expect(dialog.getAllByRole('alert')).toHaveLength(1);
    expect(authService.signIn).not.toHaveBeenCalled();
  });

  it('validates both reset fields and rechecks confirmation when the new password changes', async () => {
    const { user } = setup(true);
    const dialog = within(screen.getByRole('dialog'));
    const password = dialog.getByLabelText('New password');
    const confirmation = dialog.getByLabelText('Confirm new password');
    await user.click(dialog.getByRole('button', { name: 'Save new password' }));
    expect(dialog.getByRole('form')).toHaveAttribute('novalidate');
    expect(password).toHaveAccessibleDescription('Please enter a new password.');
    expect(confirmation).toHaveAccessibleDescription('Please confirm your new password.');
    await user.type(password, 'short');
    expect(password).toHaveAccessibleDescription('Use at least 8 characters for your password.');
    await user.type(password, '-password');
    await user.type(confirmation, 'short-password');
    expect(confirmation).not.toHaveAttribute('aria-invalid');
    await user.type(password, '-changed');
    expect(confirmation).toHaveAccessibleDescription('The passwords do not match.');
    await user.click(dialog.getByRole('button', { name: 'Save new password' }));
    expect(confirmation).toHaveFocus();
    expect(authService.updatePassword).not.toHaveBeenCalled();
  });

  it('shows standard login, navigation, and restores focus on close', async () => {
    const { user } = setup();
    const dialog = await openLogin(user);
    expect(dialog.getByLabelText(/^(Username or email|Email)$/)).toBeRequired();
    await user.click(dialog.getByRole('button', { name: 'Forgot password?' }));
    expect(dialog.getByRole('heading', { name: 'Forgot password?' })).toHaveFocus();
    await user.type(dialog.getByLabelText(/^(Username or email|Email)$/), john.email);
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
    await user.type(dialog.getByLabelText(/^(Username or email|Email)$/), john.email);
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
    expect(dialog.queryByLabelText(/^(Username or email|Email)$/)).not.toBeInTheDocument();
    await user.type(dialog.getByLabelText('Password'), 'another-password');
    await user.click(dialog.getByRole('button', { name: 'Log in' }));
    expect(authService.signIn).toHaveBeenLastCalledWith(john.email, 'another-password');
  });

  it('clears the remembered preference with Not you?', async () => {
    setRememberedUser(john);
    const { user } = setup();
    const dialog = await openLogin(user);
    await user.click(dialog.getByRole('button', { name: 'Not you?' }));
    expect(dialog.getByLabelText(/^(Username or email|Email)$/)).toHaveValue('');
    expect(dialog.getByLabelText('Password')).toHaveValue('');
    expect(getRememberedUser()).toBeNull();
  });

  it('shows useful login errors and prevents duplicate requests', async () => {
    let rejectLogin!: (error: unknown) => void;
    vi.mocked(authService.signIn).mockImplementation(() => new Promise((_, reject) => { rejectLogin = reject; }));
    const { user } = setup();
    const dialog = await openLogin(user);
    await user.type(dialog.getByLabelText(/^(Username or email|Email)$/), john.email);
    await user.type(dialog.getByLabelText('Password'), 'wrong-password');
    await user.click(dialog.getByRole('button', { name: 'Log in' }));
    expect(dialog.getByRole('button', { name: 'Logging in…' })).toBeDisabled();
    expect(dialog.getByRole('button', { name: 'Close' })).toBeDisabled();
    fireEvent.submit(dialog.getByRole('form'));
    expect(authService.signIn).toHaveBeenCalledOnce();
    await act(async () => rejectLogin({ code: 'invalid_credentials' }));
    expect(await dialog.findByRole('alert')).toHaveTextContent('username, email, or password is incorrect');
    expect(dialog.getByRole('button', { name: 'Log in' })).toBeEnabled();
  });

  it('shows registration success without authenticating the user', async () => {
    const { user } = setup();
    const dialog = await openLogin(user);
    await user.click(dialog.getByRole('button', { name: 'Register' }));
    await user.type(dialog.getByLabelText('Name'), 'John');
    await user.type(dialog.getByLabelText('Username'), 'john_doe');
    await user.type(dialog.getByLabelText(/^(Username or email|Email)$/), john.email);
    await user.type(dialog.getByLabelText('Password'), 'test-password');
    await user.click(dialog.getByRole('button', { name: 'Create account' }));
    expect(authService.signUp).toHaveBeenCalledWith('John', 'john_doe', john.email, 'test-password');
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


