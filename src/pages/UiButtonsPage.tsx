import { AuthModal } from '../features/auth/components/AuthModal';
import { Layout } from '../components/Layout';
import { Link } from 'react-router';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';

export function UiButtonsPage() {
  return (
    <>
      <Layout>
        <Link to="/ui">Back to UI showcase</Link>
        <h1>Buttons</h1>
        <Button>Example button</Button>
        <Button disabled>Disabled button</Button>
        <Button>
          <Icon name="close" /> Button with icon
        </Button>
      </Layout>
      <AuthModal />
    </>
  );
}
