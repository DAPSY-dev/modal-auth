import { useAppDispatch } from '../../../app/store';
import { showModal } from '../authSlice';

export function RegistrationSuccess() {
  const dispatch = useAppDispatch();
  return <>
    <h2 id="auth-title" tabIndex={-1}><span aria-hidden="true">✓ </span>Registration successful</h2>
    <p role="status">Please check your email to verify your account before logging in.</p>
    <p>If you already have an account, log in or reset your password. A new verification email may not be sent.</p>
    <button onClick={() => dispatch(showModal('login'))}>Back to login</button>
  </>;
}
