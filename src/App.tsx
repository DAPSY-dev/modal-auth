import { Button } from './components/Button';
import { useAppDispatch, useAppSelector } from './app/store';
import { authService } from './services/authService';
import { showModal, signedOut } from './features/auth/authSlice';
import { AuthModal } from './features/auth/components/AuthModal';
import { useAuthRequest } from './features/auth/useAuthRequest';
import { Icon } from './components/Icon';
import { Wrapper } from './components/Wrapper';

export function App() {
  const { user, status, startupError, busy } = useAppSelector(
    (state) => state.auth,
  );
  const dispatch = useAppDispatch();
  const { run, loading, error } = useAuthRequest();
  return (
    <Wrapper>
      <header>
        <a href="/" aria-label="Authentication demo home">
          Authentication demo
        </a>
        <a href="/ui">UI showcase</a>
        <nav aria-label="Account">
          {user && (
            <Button
              type="button"
              disabled={busy}
              onClick={() => dispatch(showModal('changePassword'))}
            >
              Change password
            </Button>
          )}
          <Button
            disabled={status === 'initializing' || busy}
            onClick={() => {
              if (!user) {
                dispatch(showModal('login'));
                return;
              }
              void run(async () => {
                await authService.signOut();
                dispatch(signedOut());
              });
            }}
          >
            {loading ? 'Logging out…' : user ? 'Log out' : 'Log in'}
          </Button>
        </nav>
        {error && <p role="alert">{error}</p>}
      </header>
      <main>
        <p>
          <Icon name="close-eye" label="Closed eye icon demo" />
        </p>
        {status === 'initializing' ? (
          <p role="status">Checking your session…</p>
        ) : (
          <h1>{user ? `Welcome, ${user.name}` : 'Welcome to our site'}</h1>
        )}
        {startupError && <p role="alert">{startupError}</p>}
      </main>
      <AuthModal />
    </Wrapper>
  );
}
