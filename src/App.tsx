import { AuthModal } from './features/auth/components/AuthModal';
import { useAppDispatch, useAppSelector } from './app/store';
import { Link } from './components/Link';
import { Button } from './components/Button';
import { FormError } from './components/Form';
import { showModal } from './features/auth/authSlice';
import { Icon } from './components/Icon';
import { Layout } from './components/Layout';

export function App() {
  const { user, status, startupError, busy } = useAppSelector(
    (state) => state.auth,
  );
  const dispatch = useAppDispatch();
  return (
    <>
      <Layout>
        <p>
          <Icon name="close-eye" label="Closed eye icon demo" />
        </p>
        {status === 'initializing' ? (
          <p role="status">Checking your session…</p>
        ) : (
          <h1>{user ? `Welcome, ${user.name}` : 'Welcome to our site'}</h1>
        )}
        {startupError && <FormError>{startupError}</FormError>}
        <p>
          <Link to="/ui" variant="primary">
            UI showcase
          </Link>
        </p>
        {user && (
          <Button
            variant="tertiary"
            size="xs"
            disabled={busy}
            onClick={() => dispatch(showModal('changePassword'))}
          >
            Change password
          </Button>
        )}
      </Layout>
      <AuthModal />
    </>
  );
}
