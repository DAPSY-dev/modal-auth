import { beforeEach, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { createAppStore } from '../app/store';
import { signedIn } from '../features/auth/authSlice';
import { UiPage } from '../pages/UiPage';
import { authService } from '../services/authService';
import { getRememberedUser, setRememberedUser } from '../storage/rememberedUserStorage';

vi.mock('../services/authService', async (original) => ({
  ...await original<typeof import('../services/authService')>(),
  authService: { signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn(), requestPasswordReset: vi.fn(), updatePassword: vi.fn() },
}));

const realUser = { id: 'existing-user', name: 'Existing user', email: 'existing@example.com' };

function setup() {
  const store = createAppStore();
  store.dispatch(signedIn(realUser));
  render(<Provider store={store}><MemoryRouter initialEntries={['/ui']}><UiPage /></MemoryRouter></Provider>);
  return { store, user: userEvent.setup() };
}

beforeEach(() => {
  localStorage.clear();
  setRememberedUser(realUser);
  vi.clearAllMocks();
});

it.each([
  ['Login', 'Log in'],
  ['Welcome back', 'Welcome back, Alex'],
  ['Register', 'Create an account'],
  ['Registration success', 'Registration successful'],
  ['Forgot password', 'Forgot password?'],
  ['Password reset email sent', 'Check your email'],
  ['Reset password', 'Set a new password'],
  ['Password reset success', 'Password updated'],
  ['Invalid or expired link', 'This link is invalid or has expired'],
])('opens the %s preview directly and returns focus on close', async (button, heading) => {
  const { user, store } = setup();
  const trigger = screen.getByRole('button', { name: button });
  await user.click(trigger);
  const dialog = within(screen.getByRole('dialog'));
  expect(dialog.getByRole('heading', { name: heading })).toHaveFocus();
  await user.click(dialog.getByRole('button', { name: 'Close' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
  expect(store.getState().auth.user).toEqual(realUser);
  expect(store.getState().auth.modal).toBeNull();
  expect(authService.signOut).not.toHaveBeenCalled();
});

it('simulates form transitions without changing auth state, storage, or calling Supabase', async () => {
  const { user, store } = setup();
  await user.click(screen.getByRole('button', { name: 'Register' }));
  let dialog = within(screen.getByRole('dialog'));
  await user.click(dialog.getByRole('button', { name: 'Create account' }));
  expect(dialog.getByLabelText('Username')).toHaveAttribute('aria-invalid', 'true');
  await user.type(dialog.getByLabelText('Name'), 'Demo');
  await user.type(dialog.getByLabelText('Username'), 'demo_user');
  await user.type(dialog.getByLabelText('Email'), 'demo@example.com');
  await user.type(dialog.getByLabelText('Password'), 'sample-password');
  await user.click(dialog.getByRole('button', { name: 'Create account' }));
  expect(dialog.getByRole('heading', { name: 'Registration successful' })).toBeInTheDocument();
  await user.click(dialog.getByRole('button', { name: 'Back to login' }));
  expect(dialog.getByLabelText('Username or email')).toBeInTheDocument();
  await user.type(dialog.getByLabelText('Username or email'), 'demo_user');
  await user.type(dialog.getByLabelText('Password'), 'sample-password');
  await user.click(dialog.getByRole('button', { name: 'Log in' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Forgot password' }));
  dialog = within(screen.getByRole('dialog'));
  await user.type(dialog.getByLabelText('Email'), 'demo@example.com');
  await user.click(dialog.getByRole('button', { name: 'Send reset instructions' }));
  expect(dialog.getByRole('heading', { name: 'Check your email' })).toBeInTheDocument();
  await user.click(dialog.getByRole('button', { name: 'Close' }));

  await user.click(screen.getByRole('button', { name: 'Reset password' }));
  dialog = within(screen.getByRole('dialog'));
  await user.type(dialog.getByLabelText('New password'), 'sample-password');
  await user.type(dialog.getByLabelText('Confirm new password'), 'sample-password');
  await user.click(dialog.getByRole('button', { name: 'Save new password' }));
  expect(dialog.getByRole('heading', { name: 'Password updated' })).toBeInTheDocument();
  expect(store.getState().auth.user).toEqual(realUser);
  expect(getRememberedUser()).toEqual({ email: realUser.email, name: realUser.name });
  for (const action of Object.values(authService)) expect(action).not.toHaveBeenCalled();
});

it('switches away from the sample remembered user without clearing the real preference', async () => {
  const { user } = setup();
  await user.click(screen.getByRole('button', { name: 'Welcome back' }));
  const dialog = within(screen.getByRole('dialog'));
  expect(dialog.getByText('alex@example.com')).toBeInTheDocument();
  await user.click(dialog.getByRole('button', { name: 'Not you?' }));
  expect(dialog.getByLabelText('Username or email')).toHaveValue('');
  expect(getRememberedUser()).toEqual({ email: realUser.email, name: realUser.name });
});

it('navigates from the invalid-link preview without ending the real session', async () => {
  const { user } = setup();
  await user.click(screen.getByRole('button', { name: 'Invalid or expired link' }));
  const dialog = within(screen.getByRole('dialog'));
  await user.click(dialog.getByRole('button', { name: 'Request a new reset link' }));
  expect(dialog.getByRole('heading', { name: 'Forgot password?' })).toBeInTheDocument();
  expect(authService.signOut).not.toHaveBeenCalled();
});

