import { useState } from 'react';
import { Input } from '../../../components/Input';
import { useAppDispatch } from '../../../app/store';
import { authService } from '../../../services/authService';
import { showModal } from '../authSlice';
import { useAuthRequest } from '../useAuthRequest';

export function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const { run, error, loading, setError } = useAuthRequest();
  return <>
    <h2 id="auth-title" tabIndex={-1}>Create an account</h2>
    <form aria-label="Register" aria-busy={loading} onSubmit={(event) => {
      event.preventDefault();
      if (!name.trim()) { setError('Please enter your name.'); return; }
      void run(async () => {
        await authService.signUp(name.trim(), email.trim(), password);
        dispatch(showModal('registrationSuccess'));
      });
    }}>
      <fieldset disabled={loading}>
        <legend>Account details</legend>
        <Input label="Name" name="name" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Email" name="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Password" name="password" type="password" autoComplete="new-password" required minLength={8} aria-describedby="password-requirements" value={password} onChange={(e) => setPassword(e.target.value)} />
        <p id="password-requirements">Use at least 8 characters.</p>
        <button type="submit">{loading ? 'Creating account…' : 'Create account'}</button>
        <button type="button" onClick={() => dispatch(showModal('login'))}>Back to login</button>
      </fieldset>
      {error && <p role="alert">{error}</p>}
    </form>
  </>;
}
