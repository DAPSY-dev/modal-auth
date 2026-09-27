import { AuthModal } from '../features/auth/components/AuthModal';
import { Layout } from '../components/Layout';
import { Link } from '../components/Link';

export function UiLinksPage() {
  return (
    <>
      <Layout>
        <Link to="/ui">Back to UI showcase</Link>
        <h1>Inputs</h1>
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
              <Link as="button" variant="primary">
                Link primary
              </Link>
            </p>
          </li>
          <li>
            <p>
              <Link as="button" variant="secondary">
                Link secondary
              </Link>
            </p>
          </li>
          <li>
            <p>
              <Link as="button" variant="alert">
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
