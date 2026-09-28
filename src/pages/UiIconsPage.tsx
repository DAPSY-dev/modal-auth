import { AuthModal } from '../features/auth/components/AuthModal';
import { Layout } from '../components/Layout';
import { Link } from '../components/Link';
import { Icon } from '../components/Icon';

export function UiIconsPage() {
  return (
    <>
      <Layout>
        <p>
          <Link to="/ui" variant="secondary">
            Back to UI showcase
          </Link>
        </p>
        <h1>Icons</h1>
        <ul>
          <li>
            <Icon name="close" /> Close
          </li>
          <li>
            <Icon name="close-eye" /> Closed eye
          </li>
        </ul>
      </Layout>
      <AuthModal />
    </>
  );
}
