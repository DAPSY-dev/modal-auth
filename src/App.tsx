import { useAppDispatch, useAppSelector } from './app/store';
import { authService } from './services/authService';
import { showModal, signedOut } from './features/auth/authSlice';
import { AuthModal } from './features/auth/components/AuthModal';
import { useAuthRequest } from './features/auth/useAuthRequest';

export function App() {
  const { user, status, startupError, busy } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { run, loading, error } = useAuthRequest();
  return <>
    <header>
      <a href="/" aria-label="Authentication demo home">Authentication demo</a>
      <a href="/ui">UI showcase</a>
      <nav aria-label="Account">
        {user && <button type="button" disabled={busy} onClick={() => dispatch(showModal('changePassword'))}>Change password</button>}
        <button disabled={status === 'initializing' || busy} onClick={() => {
          if (!user) { dispatch(showModal('login')); return; }
          void run(async () => { await authService.signOut(); dispatch(signedOut()); });
        }}>{loading ? 'Logging out…' : user ? 'Log out' : 'Log in'}</button>
      </nav>
      {error && <p role="alert">{error}</p>}
    </header>
    <main>
      {status === 'initializing' ? <p role="status">Checking your session…</p> :
        <h1>{user ? `Welcome, ${user.name}` : 'Welcome to our site'}</h1>}
      {startupError && <p role="alert">{startupError}</p>}
    </main>
    <AuthModal />
  </>;
}
