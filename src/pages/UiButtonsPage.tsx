import { AuthModal } from '../features/auth/components/AuthModal';
import { Layout } from '../components/Layout';
import { Link } from 'react-router';
import { Button } from '../components/Button';

export function UiButtonsPage() {
  return (
    <>
      <Layout>
        <Link to="/ui">Back to UI showcase</Link>
        <h1>Buttons</h1>
        <h2>Variants</h2>
        <ul>
          <li>
            <p>
              <Button variant="primary" size="m">
                Button primary
              </Button>
            </p>
          </li>
          <li>
            <p>
              <Button variant="secondary" size="m">
                Button secondary
              </Button>
            </p>
          </li>
          <li>
            <p>
              <Button variant="tertiary" size="m">
                Button tertiary
              </Button>
            </p>
          </li>
          <li>
            <p>
              <Button variant="primary" size="m" loading>
                Button loading
              </Button>
            </p>
          </li>
          <li>
            <p>
              <Button variant="primary" size="m" disabled>
                Button disabled
              </Button>
            </p>
          </li>
        </ul>
        <h2>Sizes</h2>
        <ul>
          <li>
            <p>
              <Button variant="primary" size="xs">
                Button XS
              </Button>
            </p>
          </li>
          <li>
            <p>
              <Button variant="primary" size="s">
                Button S
              </Button>
            </p>
          </li>
          <li>
            <p>
              <Button variant="primary" size="m">
                Button M
              </Button>
            </p>
          </li>
          <li>
            <p>
              <Button variant="primary" size="l">
                Button L
              </Button>
            </p>
          </li>
          <li>
            <p>
              <Button variant="primary" size="xl">
                Button XL
              </Button>
            </p>
          </li>
        </ul>
      </Layout>
      <AuthModal />
    </>
  );
}
