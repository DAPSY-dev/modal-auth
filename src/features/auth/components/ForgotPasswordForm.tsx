import { Button } from '../../../components/Button';
import { useState } from 'react';
import { Input } from '../../../components/Input';
import { useAppDispatch } from '../../../app/store';
import { authService } from '../../../services/authService';
import { showModal } from '../authSlice';
import { useAuthRequest } from '../useAuthRequest';
import { useFieldValidation } from '../useFieldValidation';
import { validateEmail } from '../validation';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const dispatch = useAppDispatch();
  const { run, error, loading, setError } = useAuthRequest();
  const { field, validate } = useFieldValidation({
    email: () => validateEmail(email),
  });
  return (
    <>
      <h2 id="auth-title" tabIndex={-1}>
        Forgot password?
      </h2>
      <form
        noValidate
        aria-label="Request password reset"
        aria-busy={loading}
        onSubmit={(event) => {
          event.preventDefault();
          if (loading) return;
          setError(null);
          if (!validate(event.currentTarget)) return;
          void run(async () => {
            await authService.requestPasswordReset(email.trim());
            dispatch(showModal('forgotPasswordSuccess'));
          });
        }}
      >
        <fieldset disabled={loading}>
          <legend>Recovery email</legend>
          <Input
            {...field('email')}
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit">
            {loading ? 'Sending instructions…' : 'Send reset instructions'}
          </Button>
          <Button type="button" onClick={() => dispatch(showModal('login'))}>
            Back to login
          </Button>
        </fieldset>
        {error && <p role="alert">{error}</p>}
      </form>
    </>
  );
}
