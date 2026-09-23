import { useEffect, useRef, useState } from 'react';
import { Input } from '../../../components/Input';
import { useAppDispatch } from '../../../app/store';
import { authService, UsernameUnavailableError } from '../../../services/authService';
import { showModal } from '../authSlice';
import { useAuthRequest } from '../useAuthRequest';
import { useFieldValidation } from '../useFieldValidation';
import { validateEmail, validateNewPassword, validateUsername } from '../validation';

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
    name: () => name.trim() ? undefined : 'Please enter your name.',
    username: () => validateUsername(username),
    email: () => validateEmail(email),
    password: () => validateNewPassword(password),
  });
  return <>
    <h2 id="auth-title" tabIndex={-1}>Create an account</h2>
    <form noValidate aria-label="Register" aria-busy={loading} onSubmit={(event) => {
      event.preventDefault();
      if (loading) return;
      setError(null);
      setUsernameError(undefined);
      if (!validate(event.currentTarget)) return;
      void run(async () => {
        try { await authService.signUp(name.trim(), username.trim(), email.trim(), password); }
        catch (error) {
          if (!(error instanceof UsernameUnavailableError)) throw error;
          setUsernameError(error.message);
          return;
        }
        dispatch(showModal('registrationSuccess'));
      });
    }}>
      <fieldset disabled={loading}>
        <legend>Account details</legend>
        <Input {...field('name')} label="Name" name="name" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} />
        <Input {...field('username')} ref={usernameInput} error={usernameError ?? field('username').error} label="Username" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} required aria-describedby="username-requirements" value={username} onChange={(e) => { setUsername(e.target.value); setUsernameError(undefined); }} />
        <p id="username-requirements">Use 3–30 letters, numbers, or underscores. Usernames are not case-sensitive.</p>
        <Input {...field('email')} label="Email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input {...field('password')} label="Password" name="password" type="password" autoComplete="new-password" required aria-describedby="password-requirements" value={password} onChange={(e) => setPassword(e.target.value)} />
        <p id="password-requirements">Use at least 8 characters.</p>
        <button type="submit">{loading ? 'Creating account…' : 'Create account'}</button>
        <button type="button" onClick={() => dispatch(showModal('login'))}>Back to login</button>
      </fieldset>
      {error && <p role="alert">{error}</p>}
    </form>
  </>;
}
