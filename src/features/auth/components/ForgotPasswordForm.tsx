import { useState } from 'react';
import { Input } from '../../../components/Input';
import { useAppDispatch } from '../../../app/store';
import { authService } from '../../../services/authService';
import { showModal } from '../authSlice';
import { useAuthRequest } from '../useAuthRequest';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const dispatch = useAppDispatch();
  const { run, error, loading } = useAuthRequest();
  return <>
    <h2 id="auth-title" tabIndex={-1}>Forgot password?</h2>
    <form aria-label="Request password reset" aria-busy={loading} onSubmit={(event) => {
      event.preventDefault();
      void run(async () => {
        await authService.requestPasswordReset(email.trim());
        dispatch(showModal('forgotPasswordSuccess'));
      });
    }}>
      <fieldset disabled={loading}>
        <legend>Recovery email</legend>
        <Input label="Email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <button type="submit">{loading ? 'Sending instructions…' : 'Send reset instructions'}</button>
        <button type="button" onClick={() => dispatch(showModal('login'))}>Back to login</button>
      </fieldset>
      {error && <p role="alert">{error}</p>}
    </form>
  </>;
}
