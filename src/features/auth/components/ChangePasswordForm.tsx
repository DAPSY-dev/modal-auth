import { Button } from '../../../components/Button';
import { useState } from 'react';
import { Input } from '../../../components/Input';
import { Title } from '../../../components/Title';
import { Form, FormError, FormFieldset } from '../../../components/Form';
import { Stack } from '../../../components/Stack';
import { useAppDispatch } from '../../../app/store';
import { authService } from '../../../services/authService';
import { showModal } from '../authSlice';
import { useAuthRequest } from '../useAuthRequest';
import { useFieldValidation } from '../useFieldValidation';
import { validateNewPassword, validateConfirmation } from '../validation';

export function ChangePasswordForm() {
  const [password, setPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [oldPasswordError, setOldPasswordError] = useState<string>();
  const [confirmation, setConfirmation] = useState('');
  const dispatch = useAppDispatch();
  const { run, error, loading, setError } = useAuthRequest();
  const { field, validate } = useFieldValidation({
    oldPassword: () =>
      !oldPassword ? 'Please enter your old password.' : oldPasswordError,
    password: () => validateNewPassword(password),
    confirmation: () => validateConfirmation(password, confirmation),
  });
  return (
    <Stack size="l">
      <Title id="auth-title" tabIndex={-1} className="text-center">
        Change password
      </Title>
      <p className="no-margin full-inline-size text-14 lh-130 text-secondary text-center">
        Please create and enter your new password
      </p>
      <Form
        noValidate
        aria-label="Change password"
        aria-busy={loading}
        onSubmit={(event) => {
          event.preventDefault();
          if (loading) return;
          setError(null);
          if (!validate(event.currentTarget)) return;
          void run(async () => {
            try {
              await authService.changePassword(oldPassword, password);
            } catch (error) {
              if (
                error &&
                typeof error === 'object' &&
                'code' in error &&
                (error.code === 'current_password_invalid' ||
                  error.code === 'current_password_required')
              ) {
                setOldPasswordError(
                  'Your old password is incorrect. Please try again.',
                );
                return;
              }
              throw error;
            }
            dispatch(showModal('changePasswordSuccess'));
          });
        }}
      >
        <FormFieldset disabled={loading}>
          <legend className="visually-hidden">Password details</legend>
          <Stack size="m">
            <Stack size="s">
              <Input
                {...field('oldPassword')}
                label="Old password"
                name="oldPassword"
                type="password"
                placeholder="Enter old password"
                autoComplete="current-password"
                required
                value={oldPassword}
                onChange={(e) => {
                  setOldPassword(e.target.value);
                  setOldPasswordError(undefined);
                }}
              />
              <Input
                {...field('password')}
                label="New password"
                name="password"
                type="password"
                placeholder="Enter new password"
                autoComplete="new-password"
                description="At least 1 uppercase character, 1 number, 1 lowercase character, minimum 9 symbols"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                {...field('confirmation')}
                label="Repeat new password"
                name="confirmation"
                type="password"
                placeholder="Repeat new password"
                autoComplete="new-password"
                required
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
              />
            </Stack>
            <Button
              type="submit"
              variant="primary"
              size="m"
              className="full-inline-size"
            >
              Save
            </Button>
            {error && <FormError className="text-center">{error}</FormError>}
          </Stack>
        </FormFieldset>
      </Form>
    </Stack>
  );
}
