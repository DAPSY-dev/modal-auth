import { Button } from '../../../components/Button';
import { useAppDispatch } from '../../../app/store';
import { showModal } from '../authSlice';

export function ResetPasswordSuccess() {
  const dispatch = useAppDispatch();
  return (
    <>
      <h2 id="auth-title" tabIndex={-1}>
        Password updated
      </h2>
      <p role="status">Log in with your new password to continue.</p>
      <Button onClick={() => dispatch(showModal('login'))}>
        Back to login
      </Button>
    </>
  );
}
