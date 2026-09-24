import { Button } from './Button';
import { Link } from 'react-router';
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
      <Link to="/" aria-label="Authentication demo home">
        Authentication demo
      </Link>
      <Link to="/ui">UI showcase</Link>
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
