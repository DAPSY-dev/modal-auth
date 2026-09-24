import { Button } from '../../../components/Button';
import { useState } from 'react';
import { Input } from '../../../components/Input';
import { useAppDispatch } from '../../../app/store';
import { authService } from '../../../services/authService';
import { setRememberedUser } from '../../../storage/rememberedUserStorage';
import { showModal, signedIn } from '../authSlice';
import type { RememberedUser } from '../types';
import { useAuthRequest } from '../useAuthRequest';
import { useFieldValidation } from '../useFieldValidation';
import { validateLoginIdentifier, validatePassword } from '../validation';

export function LoginForm({ rememberedUser, onSwitchAccount, preview = false }: {
  rememberedUser?: RememberedUser; onSwitchAccount?: () => void; preview?: boolean;
}) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const { run, loading, error, setError } = useAuthRequest();
  const { field, validate } = useFieldValidation({
    identifier: () => rememberedUser ? undefined : validateLoginIdentifier(identifier),
    password: () => validatePassword(password),
  });
  return (
    <>
      <h2 id="auth-title" tabIndex={-1}>{rememberedUser ? `Welcome back, ${rememberedUser.name}` : 'Log in'}</h2>
      <form noValidate aria-label="Log in" aria-busy={loading} onSubmit={(event) => {
        event.preventDefault();
        if (loading) return;
        setError(null);
        if (!validate(event.currentTarget)) return;
        if (preview) { dispatch(showModal(null)); return; }
        void run(async () => {
          const user = await authService.signIn(rememberedUser?.email ?? identifier.trim(), password);
          setRememberedUser(user);
          dispatch(signedIn(user));
        });
      }}>
        <fieldset disabled={loading}>
          <legend>Login details</legend>
          {rememberedUser ? <p>{rememberedUser.email}</p> :
            <Input {...field('identifier')} label="Username or email" name="identifier" type="text" autoComplete="username" autoCapitalize="none" spellCheck={false} required value={identifier} onChange={(e) => setIdentifier(e.target.value)} />}
          <Input {...field('password')} label="Password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit">{loading ? 'Logging in…' : 'Log in'}</Button>
          {onSwitchAccount && <Button type="button" onClick={onSwitchAccount}>Not you?</Button>}
          <Button type="button" onClick={() => dispatch(showModal('forgotPassword'))}>Forgot password?</Button>
          <Button type="button" onClick={() => dispatch(showModal('register'))}>Register</Button>
        </fieldset>
        {error && <p role="alert">{error}</p>}
      </form>
    </>
  );
}
