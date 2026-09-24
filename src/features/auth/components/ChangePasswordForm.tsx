import { Button } from '../../../components/Button';
import { useState } from 'react';
import { Input } from '../../../components/Input';
import { useAppDispatch } from '../../../app/store';
import { authService } from '../../../services/authService';
import { showModal } from '../authSlice';
import { useAuthRequest } from '../useAuthRequest';
import { useFieldValidation } from '../useFieldValidation';
import { validateNewPassword, validateConfirmation } from '../validation';

export function ChangePasswordForm({ preview = false }: { preview?: boolean }) {
  const [password, setPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [oldPasswordError, setOldPasswordError] = useState<string>();
  const [confirmation, setConfirmation] = useState('');
  const dispatch = useAppDispatch();
  const { run, error, loading, setError } = useAuthRequest();
  const { field, validate } = useFieldValidation({
    oldPassword: () => !oldPassword ? 'Please enter your old password.' : oldPasswordError,
    password: () => validateNewPassword(password),
    confirmation: () => validateConfirmation(password, confirmation),
  });
  return <>
    <h2 id="auth-title" tabIndex={-1}>Change password</h2>
    <form noValidate aria-label="Change password" aria-busy={loading} onSubmit={(event) => {
      event.preventDefault();
      if (loading) return;
      setError(null);
      if (!validate(event.currentTarget)) return;
      if (preview) { dispatch(showModal('changePasswordSuccess')); return; }
      void run(async () => {
        try {
          await authService.changePassword(oldPassword, password);
        } catch (error) {
          if (error && typeof error === 'object' && 'code' in error &&
            (error.code === 'current_password_invalid' || error.code === 'current_password_required')) {
            setOldPasswordError('Your old password is incorrect. Please try again.');
            return;
          }
          throw error;
        }
        dispatch(showModal('changePasswordSuccess'));
      });
    }}>
      <fieldset disabled={loading}>
        <legend>Password details</legend>
        <Input {...field('oldPassword')} label="Old password" name="oldPassword" type="password" autoComplete="current-password" required value={oldPassword} onChange={(e) => { setOldPassword(e.target.value); setOldPasswordError(undefined); }} />
        <Input {...field('password')} label="New password" name="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <Input {...field('confirmation')} label="Confirm new password" name="confirmation" type="password" autoComplete="new-password" required value={confirmation} onChange={(e) => setConfirmation(e.target.value)} />
        <p>Use at least 8 characters.</p>
        <Button type="submit">{loading ? 'Saving…' : 'Save new password'}</Button>
      </fieldset>
      {error && <p role="alert">{error}</p>}
    </form>
  </>;
}
