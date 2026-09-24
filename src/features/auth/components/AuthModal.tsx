import { Button } from '../../../components/Button';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { Modal } from '../../../components/Modal';
import { authService } from '../../../services/authService';
import { showModal, signedOut } from '../authSlice';
import { useAuthRequest } from '../useAuthRequest';
import { LoginForm } from './LoginForm';
import { WelcomeBackForm } from './WelcomeBackForm';
import { RegisterForm } from './RegisterForm';
import { RegistrationSuccess } from './RegistrationSuccess';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { ForgotPasswordSuccess } from './ForgotPasswordSuccess';
import { ResetPasswordForm } from './ResetPasswordForm';
import { ResetPasswordSuccess } from './ResetPasswordSuccess';
import { ChangePasswordForm } from './ChangePasswordForm';

export function AuthModal({ preview = false }: { preview?: boolean }) {
  const { modal, rememberedUser, recovery, busy } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { run, error, setError } = useAuthRequest();
  useEffect(() => {
    setError(null);
    document.getElementById('auth-title')?.focus();
  }, [modal, rememberedUser, setError]);
  if (!modal) return null;

  const close = () => {
    if (!preview && (recovery || modal === 'callbackError')) {
      void run(async () => {
        await authService.signOut(); dispatch(signedOut()); dispatch(showModal(null));
      });
    } else dispatch(showModal(null));
  };

  let view;
  switch (modal) {
    case 'login': view = !preview && rememberedUser ? <WelcomeBackForm user={rememberedUser} /> : <LoginForm preview={preview} />; break;
    case 'welcomeBack': view = preview
      ? <WelcomeBackForm preview user={{ name: 'Alex', email: 'alex@example.com' }} />
      : rememberedUser ? <WelcomeBackForm user={rememberedUser} /> : <LoginForm />; break;
    case 'register': view = <RegisterForm preview={preview} />; break;
    case 'registrationSuccess': view = <RegistrationSuccess />; break;
    case 'forgotPassword': view = <ForgotPasswordForm preview={preview} />; break;
    case 'forgotPasswordSuccess': view = <ForgotPasswordSuccess />; break;
    case 'resetPassword': view = <ResetPasswordForm preview={preview} />; break;
    case 'resetPasswordSuccess': view = <ResetPasswordSuccess />; break;
    case 'changePassword': view = <ChangePasswordForm preview={preview} />; break;
    case 'changePasswordSuccess': view = <>
      <h2 id="auth-title" tabIndex={-1}>Password changed</h2>
      <p role="status">Your password has been changed successfully.</p>
    </>; break;
    case 'callbackError': view = <>
      <h2 id="auth-title" tabIndex={-1}>This link is invalid or has expired</h2>
      <p role="alert">Please request a new password-reset email, or log in if you have already verified your account.</p>
      <Button disabled={busy} onClick={() => {
        if (preview) { dispatch(showModal('forgotPassword')); return; }
        void run(async () => {
        await authService.signOut(); dispatch(signedOut()); dispatch(showModal('forgotPassword'));
        });
      }}>Request a new reset link</Button>
    </>; break;
  }
  return <Modal busy={busy} onClose={close}>
    {view}
    {error && <p role="alert">{error}</p>}
  </Modal>;
}
