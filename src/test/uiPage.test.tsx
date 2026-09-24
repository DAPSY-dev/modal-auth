import { beforeEach, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { createAppStore } from '../app/store';
import { signedIn } from '../features/auth/authSlice';
import { UiModalsPage } from '../pages/UiModalsPage';
import { authService } from '../services/authService';
import {
  getRememberedUser,
  setRememberedUser,
} from '../storage/rememberedUserStorage';

vi.mock('../services/authService', async (original) => ({
  ...(await original<typeof import('../services/authService')>()),
  authService: {
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    requestPasswordReset: vi.fn(),
    updatePassword: vi.fn(),
    changePassword: vi.fn(),
  },
}));

const realUser = {
  id: 'existing-user',
  name: 'Existing user',
  email: 'existing@example.com',
};

function setup() {
  const store = createAppStore();
  store.dispatch(signedIn(realUser));
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/ui/modals']}>
        <UiModalsPage />
      </MemoryRouter>
    </Provider>,
  );
  return { store, user: userEvent.setup() };
}

beforeEach(() => {
  localStorage.clear();
  setRememberedUser(realUser);
  vi.resetAllMocks();
  vi.mocked(authService.signIn).mockResolvedValue(realUser);
});

it.each([
  ['Change password', 'Change password'],
  ['Password change success', 'Password changed'],
  ['Login', 'Log in'],
  ['Welcome back', 'Welcome back, Alex'],
  ['Register', 'Create an account'],
  ['Registration success', 'Registration successful'],
  ['Forgot password', 'Forgot password?'],
  ['Password reset email sent', 'Check your email'],
  ['Reset password', 'Set a new password'],
  ['Password reset success', 'Password updated'],
  ['Invalid or expired link', 'This link is invalid or has expired'],
])(
  'opens the %s modal directly and returns focus on close',
  async (button, heading) => {
    const { user, store } = setup();
    const trigger = within(screen.getByRole('main')).getByRole('button', {
      name: button,
    });
    await user.click(trigger);
    const dialog = within(screen.getByRole('dialog'));
    expect(dialog.getByRole('heading', { name: heading })).toHaveFocus();
    await user.click(dialog.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(store.getState().auth.user).toEqual(
      button === 'Invalid or expired link' ? null : realUser,
    );
    expect(store.getState().auth.modal).toBeNull();
    expect(authService.signOut).toHaveBeenCalledTimes(
      button === 'Invalid or expired link' ? 1 : 0,
    );
  },
);

it('submits password changes through the real service', async () => {
  const { user, store } = setup();
  await user.click(
    within(screen.getByRole('main')).getByRole('button', {
      name: 'Change password',
    }),
  );
  const dialog = within(screen.getByRole('dialog'));
  await user.type(dialog.getByLabelText('Old password'), 'sample-old-password');
  await user.type(dialog.getByLabelText('New password'), 'sample-password');
  await user.type(
    dialog.getByLabelText('Confirm new password'),
    'sample-password',
  );
  await user.click(dialog.getByRole('button', { name: 'Save new password' }));
  expect(
    dialog.getByRole('heading', { name: 'Password changed' }),
  ).toBeInTheDocument();
  expect(authService.changePassword).toHaveBeenCalledWith(
    'sample-old-password',
    'sample-password',
  );
  expect(store.getState().auth.user).toEqual(realUser);
});

it('submits registration, login, email, and reset actions through the shared service', async () => {
  const { user, store } = setup();
  await user.click(
    within(screen.getByRole('main')).getByRole('button', { name: 'Register' }),
  );
  let dialog = within(screen.getByRole('dialog'));
  await user.click(dialog.getByRole('button', { name: 'Create account' }));
  expect(dialog.getByLabelText('Username')).toHaveAttribute(
    'aria-invalid',
    'true',
  );
  await user.type(dialog.getByLabelText('Name'), 'Demo');
  await user.type(dialog.getByLabelText('Username'), 'demo_user');
  await user.type(dialog.getByLabelText('Email'), 'demo@example.com');
  await user.type(dialog.getByLabelText('Password'), 'sample-password');
  await user.click(dialog.getByRole('button', { name: 'Create account' }));
  expect(
    dialog.getByRole('heading', { name: 'Registration successful' }),
  ).toBeInTheDocument();
  await user.click(dialog.getByRole('button', { name: 'Back to login' }));
  expect(dialog.getByLabelText('Username or email')).toBeInTheDocument();
  await user.type(dialog.getByLabelText('Username or email'), 'demo_user');
  await user.type(dialog.getByLabelText('Password'), 'sample-password');
  await user.click(dialog.getByRole('button', { name: 'Log in' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

  await user.click(
    within(screen.getByRole('main')).getByRole('button', {
      name: 'Forgot password',
    }),
  );
  dialog = within(screen.getByRole('dialog'));
  await user.type(dialog.getByLabelText('Email'), 'demo@example.com');
  await user.click(
    dialog.getByRole('button', { name: 'Send reset instructions' }),
  );
  expect(
    dialog.getByRole('heading', { name: 'Check your email' }),
  ).toBeInTheDocument();
  await user.click(dialog.getByRole('button', { name: 'Close' }));

  await user.click(
    within(screen.getByRole('main')).getByRole('button', {
      name: 'Reset password',
    }),
  );
  dialog = within(screen.getByRole('dialog'));
  await user.type(dialog.getByLabelText('New password'), 'sample-password');
  await user.type(
    dialog.getByLabelText('Confirm new password'),
    'sample-password',
  );
  await user.click(dialog.getByRole('button', { name: 'Save new password' }));
  expect(
    dialog.getByRole('heading', { name: 'Password updated' }),
  ).toBeInTheDocument();
  expect(store.getState().auth.user).toBeNull();
  expect(getRememberedUser()).toEqual({
    email: realUser.email,
    name: realUser.name,
  });
  expect(authService.signUp).toHaveBeenCalledWith(
    'Demo',
    'demo_user',
    'demo@example.com',
    'sample-password',
  );
  expect(authService.signIn).toHaveBeenCalledWith(
    'demo_user',
    'sample-password',
  );
  expect(authService.requestPasswordReset).toHaveBeenCalledWith(
    'demo@example.com',
  );
  expect(authService.updatePassword).toHaveBeenCalledWith('sample-password');
  expect(authService.signOut).toHaveBeenCalledOnce();
});

it('switches away from the sample remembered user without clearing the real preference', async () => {
  const { user } = setup();
  await user.click(
    within(screen.getByRole('main')).getByRole('button', {
      name: 'Welcome back',
    }),
  );
  const dialog = within(screen.getByRole('dialog'));
  expect(dialog.getByText('alex@example.com')).toBeInTheDocument();
  await user.click(dialog.getByRole('button', { name: 'Not you?' }));
  expect(dialog.getByLabelText('Username or email')).toHaveValue('');
  expect(getRememberedUser()).toEqual({
    email: realUser.email,
    name: realUser.name,
  });
});

it('uses real session cleanup when leaving the invalid-link modal', async () => {
  const { user } = setup();
  await user.click(
    within(screen.getByRole('main')).getByRole('button', {
      name: 'Invalid or expired link',
    }),
  );
  const dialog = within(screen.getByRole('dialog'));
  await user.click(
    dialog.getByRole('button', { name: 'Request a new reset link' }),
  );
  expect(
    dialog.getByRole('heading', { name: 'Forgot password?' }),
  ).toBeInTheDocument();
  expect(authService.signOut).toHaveBeenCalledOnce();
});

it('uses sample identity only for display until an actual login succeeds', async () => {
  const { user, store } = setup();
  await user.click(
    within(screen.getByRole('main')).getByRole('button', {
      name: 'Welcome back',
    }),
  );
  const dialog = within(screen.getByRole('dialog'));
  expect(store.getState().auth.rememberedUser?.email).toBe(realUser.email);
  await user.type(dialog.getByLabelText('Password'), 'sample-password');
  await user.click(dialog.getByRole('button', { name: 'Log in' }));
  expect(authService.signIn).toHaveBeenCalledWith(
    'alex@example.com',
    'sample-password',
  );
});
