import { Button } from '../../../components/Button';
import { useEffect, useRef, useState } from 'react';
import { Input } from '../../../components/Input';
import { Link } from '../../../components/Link';
import { Title } from '../../../components/Title';
import { Form, FormError, FormFieldset } from '../../../components/Form';
import { Stack } from '../../../components/Stack';
import { useAppDispatch } from '../../../app/store';
import {
  authService,
  UsernameUnavailableError,
} from '../../../services/authService';
import { showModal } from '../authSlice';
import { useAuthRequest } from '../useAuthRequest';
import { useFieldValidation } from '../useFieldValidation';
import {
  validateEmail,
  validateNewPassword,
  validateUsername,
} from '../validation';

export function RegisterForm() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState<string>();
  const usernameInput = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const { run, error, loading, setError } = useAuthRequest();
  useEffect(() => {
    if (usernameError && !loading) usernameInput.current?.focus();
  }, [usernameError, loading]);
  const { field, validate } = useFieldValidation({
    name: () => (name.trim() ? undefined : 'Please enter your name.'),
    username: () => validateUsername(username),
    email: () => validateEmail(email),
    password: () => validateNewPassword(password),
  });
  return (
    <Stack size="l">
      <Title id="auth-title" tabIndex={-1} className="text-center">
        Create an account
      </Title>
      <Form
        noValidate
        aria-label="Register"
        aria-busy={loading}
        onSubmit={(event) => {
          event.preventDefault();
          if (loading) return;
          setError(null);
          setUsernameError(undefined);
          if (!validate(event.currentTarget)) return;
          void run(async () => {
            try {
              await authService.signUp(
                name.trim(),
                username.trim(),
                email.trim(),
                password,
              );
            } catch (error) {
              if (!(error instanceof UsernameUnavailableError)) throw error;
              setUsernameError(error.message);
              return;
            }
            dispatch(showModal('registrationSuccess'));
          });
        }}
      >
        <FormFieldset disabled={loading}>
          <legend className="visually-hidden">Account details</legend>
          <Stack size="m">
            <Stack size="s">
              <Input
                {...field('name')}
                label="Name"
                name="name"
                placeholder="Enter name"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                {...field('username')}
                ref={usernameInput}
                error={usernameError ?? field('username').error}
                label="Username"
                name="username"
                placeholder="Enter username"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                required
                aria-describedby="username-requirements"
                description="Use 3–30 letters, numbers, or underscores. Usernames are not case-sensitive."
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameError(undefined);
                }}
              />
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
              <Input
                {...field('password')}
                label="Password"
                name="password"
                type="password"
                placeholder="Enter password"
                autoComplete="new-password"
                required
                aria-describedby="password-requirements"
                description="Use at least 8 characters."
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
              Create account
            </Button>
            {error && <FormError className="text-center">{error}</FormError>}
            <Link
              as="button"
              variant="secondary"
              onClick={() => dispatch(showModal('login'))}
              className="full-inline-size text-14 lh-130 text-center"
            >
              Back to login
            </Link>
          </Stack>
        </FormFieldset>
      </Form>
    </Stack>
  );
}
