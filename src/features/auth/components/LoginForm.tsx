import { useState } from 'react';
import { Input } from '../../../components/Input';
import { useAppDispatch } from '../../../app/store';
import { authService } from '../../../services/authService';
import { setRememberedUser } from '../../../storage/rememberedUserStorage';
import { showModal, signedIn } from '../authSlice';
import type { RememberedUser } from '../types';
import { useAuthRequest } from '../useAuthRequest';

export function LoginForm({ rememberedUser, onSwitchAccount }: {
  rememberedUser?: RememberedUser; onSwitchAccount?: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const { run, loading, error } = useAuthRequest();
  return (
    <>
      <h2 id="auth-title" tabIndex={-1}>{rememberedUser ? `Welcome back, ${rememberedUser.name}` : 'Log in'}</h2>
      <form aria-label="Log in" aria-busy={loading} onSubmit={(event) => {
        event.preventDefault();
        void run(async () => {
          const user = await authService.signIn(rememberedUser?.email ?? email.trim(), password);
          setRememberedUser(user);
          dispatch(signedIn(user));
        });
      }}>
        <fieldset disabled={loading}>
          <legend>Login details</legend>
          {rememberedUser ? <p>{rememberedUser.email}</p> :
            <Input label="Email" name="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />}
          <Input label="Password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit">{loading ? 'Logging in…' : 'Log in'}</button>
          {onSwitchAccount && <button type="button" onClick={onSwitchAccount}>Not you?</button>}
          <button type="button" onClick={() => dispatch(showModal('forgotPassword'))}>Forgot password?</button>
          <button type="button" onClick={() => dispatch(showModal('register'))}>Register</button>
        </fieldset>
        {error && <p role="alert">{error}</p>}
      </form>
    </>
  );
}
