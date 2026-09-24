import { Button } from '../../../components/Button';
import { useAppDispatch } from '../../../app/store';
import { showModal } from '../authSlice';

export function ForgotPasswordSuccess() {
  const dispatch = useAppDispatch();
  return <>
    <h2 id="auth-title" tabIndex={-1}>Check your email</h2>
    <p role="status">If an account exists for that address, you will receive password-reset instructions.</p>
    <Button onClick={() => dispatch(showModal('login'))}>Back to login</Button>
  </>;
}
