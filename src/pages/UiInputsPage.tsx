import { AuthModal } from '../features/auth/components/AuthModal';
import { Layout } from '../components/Layout';
import { Link } from '../components/Link';
import { Input } from '../components/Input';

export function UiInputsPage() {
  return (
    <>
      <Layout>
        <Link to="/ui">Back to UI showcase</Link>
        <h1>Inputs</h1>
        <ul>
          <li>
            <p>
              <Input
                label="Example text"
                type="text"
                placeholder="Enter text"
                description="This is an example of a description."
              />
            </p>
          </li>
          <li>
            <p>
              <Input
                label="Example email"
                type="email"
                placeholder="name@example.com"
              />
            </p>
          </li>
          <li>
            <p>
              <Input
                label="Example password"
                type="password"
                autoComplete="off"
              />
            </p>
          </li>
          <li>
            <p>
              <Input label="Example text" type="text" success />
            </p>
          </li>
          <li>
            <p>
              <Input
                label="Input with error"
                error="This is an example validation error."
              />
            </p>
          </li>
          <li>
            <p>
              <Input
                label="Disabled input"
                disabled
                defaultValue="Disabled value"
              />
            </p>
          </li>
        </ul>
      </Layout>
      <AuthModal />
    </>
  );
}
