import { Button } from '../../../components/Button';
import { useState } from 'react';
import { Input } from '../../../components/Input';
import { Title } from '../../../components/Title';
import { Form, FormError, FormFieldset } from '../../../components/Form';
import { Stack } from '../../../components/Stack';
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
  return (
    <Stack size="l">
      <Title id="auth-title" tabIndex={-1} className="text-center">
        New password
      </Title>
      <Form
        noValidate
        aria-label="Reset password"
        aria-busy={loading}
        onSubmit={(event) => {
          event.preventDefault();
          if (loading) return;
          setError(null);
          if (!passwordUpdated && !validate(event.currentTarget)) return;
          void run(async () => {
            if (!passwordUpdated) {
              await authService.updatePassword(password);
              setPasswordUpdated(true);
              setPassword('');
              setConfirmation('');
            }
            // A failed sign-out can be retried without submitting the password change again.
            await authService.signOut();
            dispatch(signedOut());
            dispatch(showModal('resetPasswordSuccess'));
          });
        }}
      >
        <FormFieldset disabled={loading}>
          <legend className="visually-hidden">New password</legend>
          <Stack size="m">
            {passwordUpdated ? (
              <p
                role="status"
                className="no-margin full-inline-size text-14 lh-130 text-secondary text-center"
              >
                Your password was changed. Finish signing out to return to
                login.
              </p>
            ) : (
              <Stack size="s">
                <Input
                  {...field('password')}
                  label="New password"
                  name="password"
                  type="password"
                  placeholder="Enter password"
                  autoComplete="new-password"
                  description="At least 1 uppercase character, 1 number, 1 lowercase character, minimum 9 symbols"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Input
                  {...field('confirmation')}
                  label="Confirm new password"
                  name="confirmation"
                  type="password"
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  required
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                />
              </Stack>
            )}
            <Button
              type="submit"
              variant="primary"
              size="m"
              className="full-inline-size"
            >
              {passwordUpdated ? 'Finish signing out' : 'Reset and login'}
            </Button>
            {error && <FormError className="text-center">{error}</FormError>}
          </Stack>
        </FormFieldset>
      </Form>
    </Stack>
  );
}
