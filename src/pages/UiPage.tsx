import { AuthModal } from '../features/auth/components/AuthModal';
import { Layout } from '../components/Layout';
import { Link } from '../components/Link';

export function UiPage() {
  return (
    <>
      <Layout>
        <p>
          <Link to="/" variant="secondary">
            Back to home
          </Link>
        </p>
        <h1>UI showcase</h1>
        <p>Choose a component to explore its examples.</p>
        <nav aria-label="Component showcases">
          <ul>
            <li>
              <Link to="/ui/modals" variant="primary">
                Modals
              </Link>
            </li>
            <li>
              <Link to="/ui/links" variant="primary">
                Links
              </Link>
            </li>
            <li>
              <Link to="/ui/buttons" variant="primary">
                Buttons
              </Link>
            </li>
            <li>
              <Link to="/ui/inputs" variant="primary">
                Inputs
              </Link>
            </li>
            <li>
              <Link to="/ui/icons" variant="primary">
                Icons
              </Link>
            </li>
          </ul>
        </nav>
      </Layout>
      <AuthModal />
    </>
  );
}
