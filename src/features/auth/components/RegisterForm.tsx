import { useState } from 'react';
import { Input } from '../../../components/Input';
import { useAppDispatch } from '../../../app/store';
import { authService } from '../../../services/authService';
import { showModal } from '../authSlice';
import { useAuthRequest } from '../useAuthRequest';
import { useFieldValidation } from '../useFieldValidation';
import { validateEmail, validateNewPassword } from '../validation';

export function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const { run, error, loading, setError } = useAuthRequest();
  const { field, validate } = useFieldValidation({
    name: () => name.trim() ? undefined : 'Please enter your name.',
    email: () => validateEmail(email),
    password: () => validateNewPassword(password),
  });
  return <>
    <h2 id="auth-title" tabIndex={-1}>Create an account</h2>
    <form noValidate aria-label="Register" aria-busy={loading} onSubmit={(event) => {
      event.preventDefault();
      if (loading) return;
      setError(null);
      if (!validate(event.currentTarget)) return;
      void run(async () => {
        await authService.signUp(name.trim(), email.trim(), password);
        dispatch(showModal('registrationSuccess'));
      });
    }}>
      <fieldset disabled={loading}>
        <legend>Account details</legend>
        <Input {...field('name')} label="Name" name="name" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} />
        <Input {...field('email')} label="Email" name="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input {...field('password')} label="Password" name="password" type="password" autoComplete="new-password" required aria-describedby="password-requirements" value={password} onChange={(e) => setPassword(e.target.value)} />
        <p id="password-requirements">Use at least 8 characters.</p>
        <button type="submit">{loading ? 'Creating account…' : 'Create account'}</button>
        <button type="button" onClick={() => dispatch(showModal('login'))}>Back to login</button>
      </fieldset>
      {error && <p role="alert">{error}</p>}
    </form>
  </>;
}
