import { AuthModal } from '../features/auth/components/AuthModal';
import { Layout } from '../components/Layout';
import { Link } from 'react-router';
import { Icon } from '../components/Icon';

export function UiIconsPage() {
  return (
    <>
      <Layout>
        <Link to="/ui">Back to UI showcase</Link>
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
