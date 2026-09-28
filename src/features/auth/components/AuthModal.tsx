import { Button } from '../../../components/Button';
import { useEffect, type ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { Title } from '../../../components/Title';
import { Stack } from '../../../components/Stack';
import { Icon } from '../../../components/Icon';
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

export function AuthModal({ loginForm }: { loginForm?: ReactNode }) {
  const { modal, rememberedUser, recovery, busy } = useAppSelector(
    (state) => state.auth,
  );
  const dispatch = useAppDispatch();
  const { run, error, setError } = useAuthRequest();
  useEffect(() => {
    setError(null);
    document.getElementById('auth-title')?.focus();
  }, [modal, rememberedUser, setError]);
  if (!modal) return null;

  const close = () => {
    if (recovery || modal === 'callbackError') {
      void run(async () => {
        await authService.signOut();
        dispatch(signedOut());
        dispatch(showModal(null));
      });
    } else dispatch(showModal(null));
  };

  let view;
  switch (modal) {
    case 'login':
    case 'welcomeBack':
      view =
        loginForm ??
        (rememberedUser ? (
          <WelcomeBackForm user={rememberedUser} />
        ) : (
          <LoginForm />
        ));
      break;
    case 'register':
      view = <RegisterForm />;
      break;
    case 'registrationSuccess':
      view = <RegistrationSuccess />;
      break;
    case 'forgotPassword':
      view = <ForgotPasswordForm />;
      break;
    case 'forgotPasswordSuccess':
      view = <ForgotPasswordSuccess />;
      break;
    case 'resetPassword':
      view = <ResetPasswordForm />;
      break;
    case 'resetPasswordSuccess':
      view = <ResetPasswordSuccess />;
      break;
    case 'changePassword':
      view = <ChangePasswordForm />;
      break;
    case 'changePasswordSuccess':
      view = (
        <Stack size="l">
          <Title id="auth-title" tabIndex={-1} className="text-center">
            Password changed
          </Title>
          <p
            role="status"
            className="no-margin text-14 lh-130 text-secondary text-center"
          >
            Your password has been changed successfully.
          </p>
          <div className="text-center">
            <Icon
              name="notification-success"
              className="display-inline-block size-xs text-success"
            />
          </div>
        </Stack>
      );
      break;
    case 'callbackError':
      view = (
        <Stack size="l">
          <Title id="auth-title" tabIndex={-1} className="text-center">
            This link is invalid or has expired
          </Title>
          <p role="alert" className="no-margin text-14 lh-130 text-secondary">
            Please request a new password-reset email, or log in if you have
            already verified your account.
          </p>
          <Button
            variant="primary"
            size="m"
            disabled={busy}
            onClick={() => {
              void run(async () => {
                await authService.signOut();
                dispatch(signedOut());
                dispatch(showModal('forgotPassword'));
              });
            }}
            className="full-inline-size"
          >
            Request a new reset link
          </Button>
        </Stack>
      );
      break;
  }
  return (
    <Modal busy={busy} onClose={close}>
      {view}
      {error && <p role="alert">{error}</p>}
    </Modal>
  );
}
