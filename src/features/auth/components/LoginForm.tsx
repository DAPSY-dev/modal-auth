import { Button } from '../../../components/Button';
import { Link } from '../../../components/Link';
import { useState } from 'react';
import { Input } from '../../../components/Input';
import { Title } from '../../../components/Title';
import { Form, FormError, FormFieldset } from '../../../components/Form';
import { Stack } from '../../../components/Stack';
import { useAppDispatch } from '../../../app/store';
import { authService } from '../../../services/authService';
import { setRememberedUser } from '../../../storage/rememberedUserStorage';
import { showModal, signedIn } from '../authSlice';
import type { RememberedUser } from '../types';
import { useAuthRequest } from '../useAuthRequest';
import { useFieldValidation } from '../useFieldValidation';
import { validateLoginIdentifier, validatePassword } from '../validation';

export function LoginForm({
  rememberedUser,
  onSwitchAccount,
}: {
  rememberedUser?: RememberedUser;
  onSwitchAccount?: () => void;
}) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const { run, loading, error, setError } = useAuthRequest();
  const { field, validate } = useFieldValidation({
    identifier: () =>
      rememberedUser ? undefined : validateLoginIdentifier(identifier),
    password: () => validatePassword(password),
  });
  return (
    <Stack size="l">
      <Title id="auth-title" tabIndex={-1} className="text-center">
        {rememberedUser ? `Welcome back, ${rememberedUser.name}!` : 'Log in'}
      </Title>
      <Stack size="m">
        <p className="no-margin full-inline-size text-14 lh-130 text-secondary text-center">
          Don’t have an account?{' '}
          <Link
            as="button"
            variant="primary"
            onClick={() => dispatch(showModal('register'))}
            className="text-uppercase"
          >
            Register Now
          </Link>
        </p>
        <Form
          noValidate
          aria-label="Log in"
          aria-busy={loading}
          onSubmit={(event) => {
            event.preventDefault();
            if (loading) return;
            setError(null);
            if (!validate(event.currentTarget)) return;
            void run(async () => {
              const user = await authService.signIn(
                rememberedUser?.email ?? identifier.trim(),
                password,
              );
              setRememberedUser(user);
              dispatch(signedIn(user));
            });
          }}
        >
          <FormFieldset disabled={loading}>
            <legend className="visually-hidden">Login details</legend>
            <Stack size="m">
              <Stack size="s">
                {!rememberedUser && (
                  <Input
                    {...field('identifier')}
                    label="E-mail"
                    name="identifier"
                    type="text"
                    placeholder="Enter e-mail"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                )}
                <Input
                  {...field('password')}
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Stack>
              <Button
                type="submit"
                variant="primary"
                size="m"
                className="full-inline-size"
              >
                Log in
              </Button>
              {error && <FormError className="text-center">{error}</FormError>}
              <Link
                as="button"
                variant="secondary"
                onClick={() => dispatch(showModal('forgotPassword'))}
                className="full-inline-size text-14 lh-130 text-center"
              >
                Forgot your password?
              </Link>
              {onSwitchAccount && rememberedUser && (
                <>
                  <p>Not {rememberedUser.name}?</p>
                  <Button type="button" onClick={onSwitchAccount}>
                    Log in with another account
                  </Button>
                </>
              )}
            </Stack>
          </FormFieldset>
        </Form>
      </Stack>
    </Stack>
  );
}
