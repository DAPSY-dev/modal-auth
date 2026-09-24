import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '../components/Button';
import { useAppDispatch, useAppSelector } from '../app/store';
import { showModal } from '../features/auth/authSlice';
import { AuthModal } from '../features/auth/components/AuthModal';
import { LoginForm } from '../features/auth/components/LoginForm';
import type { AuthModalState } from '../features/auth/types';
import { UsernameRecoveryPreview } from './UsernameRecoveryPreview';
import { AccountFrozenPreview } from './AccountFrozenPreview';

const sections: { title: string; description: string; modals: { state: Exclude<AuthModalState, null>; label: string }[] }[] = [
  { title: 'Logged out', description: 'Use these forms to sign in, register, or request a password reset. Welcome back uses Alex (alex@example.com) as sample display data; submitting it attempts a real login for that address.', modals: [
    { state: 'login', label: 'Login' },
    { state: 'welcomeBack', label: 'Welcome back' },
    { state: 'register', label: 'Register' },
    { state: 'forgotPassword', label: 'Forgot password' },
  ] },
  { title: 'Logged in', description: 'You must be logged in to successfully change your password.', modals: [
    { state: 'changePassword', label: 'Change password' },
  ] },
  { title: 'Password recovery', description: 'Saving a new password requires a valid recovery session from an email link.', modals: [
    { state: 'resetPassword', label: 'Reset password' },
  ] },
  { title: 'Status messages', description: 'Open these messages directly for styling. Opening a success message does not perform its action. Closing the invalid-link modal or requesting another link signs you out.', modals: [
    { state: 'registrationSuccess', label: 'Registration success' },
    { state: 'forgotPasswordSuccess', label: 'Password reset email sent' },
    { state: 'resetPasswordSuccess', label: 'Password reset success' },
    { state: 'changePasswordSuccess', label: 'Password change success' },
    { state: 'callbackError', label: 'Invalid or expired link' },
  ] },
];

export function UiPage() {
  const dispatch = useAppDispatch();
  const { user, modal } = useAppSelector((state) => state.auth);
  const [dummy, setDummy] = useState<'username' | 'frozen' | null>(null);
  return <>
    <header><Link to="/">Back to home</Link></header>
    <main>
      <h1>UI showcase</h1>
      <p>{user ? 'Logged in as ' + user.name + ' (' + user.email + ').' : 'You are logged out.'}</p>
      <p>These are the real forms. Submissions can sign you in, create accounts, send emails, or change your password.</p>
      {sections.map(({ title, description, modals }) => <section key={title} aria-label={title}>
        <h2>{title}</h2>
        <p>{description}</p>
        <ul>{modals.map(({ state, label }) => <li key={state}>
          <Button onClick={() => { setDummy(null); dispatch(showModal(state)); }}>{label}</Button>
        </li>)}</ul>
      </section>)}
      <section aria-label="Dummy modals">
        <h2>Dummy modals</h2>
        <p>These examples have no backend behavior.</p>
        <Button onClick={() => setDummy('username')}>Username recovery (dummy)</Button>
        <Button onClick={() => setDummy('frozen')}>Account frozen (dummy)</Button>
      </section>
    </main>
    <AuthModal loginForm={modal === 'welcomeBack'
      ? <LoginForm key="remembered" rememberedUser={{ name: 'Alex', email: 'alex@example.com' }} onSwitchAccount={() => dispatch(showModal('login'))} />
      : <LoginForm key="login" />} />
    {dummy === 'username' && <UsernameRecoveryPreview onClose={() => setDummy(null)} />}
    {dummy === 'frozen' && <AccountFrozenPreview onClose={() => setDummy(null)} />}
  </>;
}
