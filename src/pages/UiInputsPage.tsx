import { AuthModal } from '../features/auth/components/AuthModal';
import { Layout } from '../components/Layout';
import { Link } from 'react-router';
import { Input } from '../components/Input';

export function UiInputsPage() {
  return (
    <>
      <Layout>
        <Link to="/ui">Back to UI showcase</Link>
        <h1>Inputs</h1>
        <Input label="Example text" type="text" placeholder="Enter text" />
        <Input
          label="Example email"
          type="email"
          placeholder="name@example.com"
        />
        <Input label="Example password" type="password" autoComplete="off" />
        <Input
          label="Input with error"
          error="This is an example validation error."
        />
        <Input label="Disabled input" disabled defaultValue="Disabled value" />
      </Layout>
      <AuthModal />
    </>
  );
}
