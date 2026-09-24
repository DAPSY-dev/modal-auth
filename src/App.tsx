import { AuthModal } from './features/auth/components/AuthModal';
import { useAppSelector } from './app/store';
import { Icon } from './components/Icon';
import { Layout } from './components/Layout';

export function App() {
  const { user, status, startupError } = useAppSelector((state) => state.auth);
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
        {startupError && <p role="alert">{startupError}</p>}
      </Layout>
      <AuthModal />
    </>
  );
}
