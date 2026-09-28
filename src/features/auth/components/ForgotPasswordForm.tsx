import { Button } from '../../../components/Button';
import { useState } from 'react';
import { Input } from '../../../components/Input';
import { Stack } from '../../../components/Stack';
import { Title } from '../../../components/Title';
import { Form, FormError, FormFieldset } from '../../../components/Form';
import { Link } from '../../../components/Link';
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
    <Stack size="l">
      <Title id="auth-title" tabIndex={-1} className="text-center">
        Password recovery
      </Title>
      <p className="no-margin full-inline-size text-14 lh-130 text-secondary">
        Don’t worry, it happens. We’ll send you reset instructions
      </p>
      <Form
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
        <FormFieldset disabled={loading}>
          <legend className="visually-hidden">Recovery email</legend>
          <Stack size="m">
            <Input
              {...field('email')}
              label="Email"
              name="email"
              type="email"
              placeholder="Enter e-mail"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              type="submit"
              variant="primary"
              size="m"
              className="full-inline-size"
            >
              Reset password
            </Button>
            {error && <FormError className="text-center">{error}</FormError>}
            <p className="no-margin full-inline-size text-14 lh-130 text-secondary text-center">
              Forgot your username?{' '}
              <Link as="button" variant="primary" className="text-uppercase">
                RECOVER IT
              </Link>
            </p>
          </Stack>
        </FormFieldset>
      </Form>
    </Stack>
  );
}
