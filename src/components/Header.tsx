import { Button } from './Button';
import { useAppDispatch, useAppSelector } from '../app/store';
import { authService } from '../services/authService';
import { showModal, signedOut } from '../features/auth/authSlice';
import { useAuthRequest } from '../features/auth/useAuthRequest';

export function Header() {
  const { user, status, busy } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { run, loading, error } = useAuthRequest();
  return (
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
  );
}
