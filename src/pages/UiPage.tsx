import { AuthModal } from '../features/auth/components/AuthModal';
import { Layout } from '../components/Layout';
import { Link } from 'react-router';

export function UiPage() {
  return (
    <>
      <Layout>
        <Link to="/">Back to home</Link>
        <h1>UI showcase</h1>
        <p>Choose a component to explore its examples.</p>
        <nav aria-label="Component showcases">
          <ul>
            <li>
              <Link to="/ui/modals">Modals</Link>
            </li>
            <li>
              <Link to="/ui/buttons">Buttons</Link>
            </li>
            <li>
              <Link to="/ui/inputs">Inputs</Link>
            </li>
            <li>
              <Link to="/ui/icons">Icons</Link>
            </li>
          </ul>
        </nav>
      </Layout>
      <AuthModal />
    </>
  );
}
