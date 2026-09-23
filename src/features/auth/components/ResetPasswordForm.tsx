import { useState } from 'react';
import { Input } from '../../../components/Input';
import { useAppDispatch } from '../../../app/store';
import { authService } from '../../../services/authService';
import { showModal, signedOut } from '../authSlice';
import { useAuthRequest } from '../useAuthRequest';
import { useFieldValidation } from '../useFieldValidation';
import { validateNewPassword, validateConfirmation } from '../validation';

export function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const dispatch = useAppDispatch();
  const { run, error, loading, setError } = useAuthRequest();
  const { field, validate } = useFieldValidation({
    password: () => validateNewPassword(password),
    confirmation: () => validateConfirmation(password, confirmation),
  });
  return <>
    <h2 id="auth-title" tabIndex={-1}>Set a new password</h2>
    <form noValidate aria-label="Reset password" aria-busy={loading} onSubmit={(event) => {
      event.preventDefault();
      if (loading) return;
      setError(null);
      if (!passwordUpdated && !validate(event.currentTarget)) return;
      void run(async () => {
        if (!passwordUpdated) {
          await authService.updatePassword(password);
          setPasswordUpdated(true); setPassword(''); setConfirmation('');
        }
        // A failed sign-out can be retried without submitting the password change again.
        await authService.signOut();
        dispatch(signedOut());
        dispatch(showModal('resetPasswordSuccess'));
      });
    }}>
      <fieldset disabled={loading}>
        <legend>New password</legend>
        {passwordUpdated ? <p role="status">Your password was changed. Finish signing out to return to login.</p> : <>
          <Input {...field('password')} label="New password" name="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          <Input {...field('confirmation')} label="Confirm new password" name="confirmation" type="password" autoComplete="new-password" required value={confirmation} onChange={(e) => setConfirmation(e.target.value)} />
          <p>Use at least 8 characters.</p>
        </>}
        <button type="submit">{loading ? 'Saving…' : passwordUpdated ? 'Finish signing out' : 'Save new password'}</button>
      </fieldset>
      {error && <p role="alert">{error}</p>}
    </form>
  </>;
}
