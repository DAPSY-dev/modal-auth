import { AuthModal } from '../features/auth/components/AuthModal';
import { Layout } from '../components/Layout';
import { Link } from '../components/Link';

export function UiLinksPage() {
  return (
    <>
      <Layout>
        <p>
          <Link to="/ui" variant="secondary">
            Back to UI showcase
          </Link>
        </p>
        <h1>Links</h1>
        <h2>Types</h2>
        <ul>
          <li>
            <p>
              <Link to="/">Router link</Link>
            </p>
          </li>
          <li>
            <p>
              <Link as="a" href="/">
                Link
              </Link>
            </p>
          </li>
          <li>
            <p>
              <Link as="button">Button</Link>
            </p>
          </li>
        </ul>
        <h2>Variants</h2>
        <ul>
          <li>
            <p>
              <Link as="button" variant="primary" className="text-uppercase">
                Link primary
              </Link>
            </p>
          </li>
          <li>
            <p>
              <Link as="button" variant="secondary" className="text-uppercase">
                Link secondary
              </Link>
            </p>
          </li>
          <li>
            <p>
              <Link as="button" variant="alert" className="text-uppercase">
                Link alert
              </Link>
            </p>
          </li>
        </ul>
      </Layout>
      <AuthModal />
    </>
  );
}
