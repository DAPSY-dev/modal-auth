import { useState } from 'react';
import { Provider } from 'react-redux';
import { Link } from 'react-router';
import { createAppStore, useAppDispatch } from '../app/store';
import { showModal } from '../features/auth/authSlice';
import { AuthModal } from '../features/auth/components/AuthModal';
import type { AuthModalState } from '../features/auth/types';
import { UsernameRecoveryPreview } from './UsernameRecoveryPreview';
import { AccountFrozenPreview } from './AccountFrozenPreview';

export const modalPreviews: { state: Exclude<AuthModalState, null>; label: string }[] = [
  { state: 'login', label: 'Login' },
  { state: 'welcomeBack', label: 'Welcome back' },
  { state: 'register', label: 'Register' },
  { state: 'registrationSuccess', label: 'Registration success' },
  { state: 'forgotPassword', label: 'Forgot password' },
  { state: 'forgotPasswordSuccess', label: 'Password reset email sent' },
  { state: 'resetPassword', label: 'Reset password' },
  { state: 'resetPasswordSuccess', label: 'Password reset success' },
  { state: 'changePassword', label: 'Change password' },
  { state: 'changePasswordSuccess', label: 'Password change success' },
  { state: 'callbackError', label: 'Invalid or expired link' },
];

function ModalShowcase() {
  const dispatch = useAppDispatch();
  const [showUsernameRecovery, setShowUsernameRecovery] = useState(false);
  const [showAccountFrozen, setShowAccountFrozen] = useState(false);
  return <>
    <header><Link to="/">Back to home</Link></header>
    <main>
      <h1>UI showcase</h1>
      <p>Open a modal to preview and style it.</p>
      <p>Preview mode uses sample data. Forms validate normally, but submissions are simulated and do not change your account or send emails.</p>
      <ul>
        {modalPreviews.map(({ state, label }) => <li key={state}>
          <button type="button" onClick={() => dispatch(showModal(state))}>{label}</button>
        </li>)}
        <li><button type="button" onClick={() => setShowUsernameRecovery(true)}>Username recovery (dummy)</button></li>
        <li><button type="button" onClick={() => setShowAccountFrozen(true)}>Account frozen (dummy)</button></li>
      </ul>
    </main>
    <AuthModal preview />
    {showUsernameRecovery && <UsernameRecoveryPreview onClose={() => setShowUsernameRecovery(false)} />}
    {showAccountFrozen && <AccountFrozenPreview onClose={() => setShowAccountFrozen(false)} />}
  </>;
}

export function UiPage() {
  // The showcase's modal navigation must not touch the application's auth state.
  const [previewStore] = useState(createAppStore);
  return <Provider store={previewStore}><ModalShowcase /></Provider>;
}
