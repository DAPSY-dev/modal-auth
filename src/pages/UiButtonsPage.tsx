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
            <Button>Button</Button>
          </li>
          <li>
            <Button variant="primary">Button</Button>
          </li>
          <li>
            <Button variant="secondary">Button</Button>
          </li>
          <li>
            <Button variant="tertiary">Button</Button>
          </li>
          <li>
            <Button variant="primary" loading>
              Button
            </Button>
          </li>
          <li>
            <Button variant="primary" disabled>
              Button
            </Button>
          </li>
        </ul>
        <h2>Sizes</h2>
        <ul>
          <li>
            <Button variant="primary" size="xs">
              Button
            </Button>
          </li>
          <li>
            <Button variant="primary" size="s">
              Button
            </Button>
          </li>
          <li>
            <Button variant="primary" size="m">
              Button
            </Button>
          </li>
          <li>
            <Button variant="primary" size="l">
              Button
            </Button>
          </li>
          <li>
            <Button variant="primary" size="xl">
              Button
            </Button>
          </li>
        </ul>
      </Layout>
      <AuthModal />
    </>
  );
}
