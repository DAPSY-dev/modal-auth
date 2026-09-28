import { Button } from '../components/Button';
import { useEffect } from 'react';
import { Input } from '../components/Input';
import { Title } from '../components/Title';
import { Link } from '../components/Link';
import { Stack } from '../components/Stack';
import { Modal } from '../components/Modal';

export function UsernameRecoveryPreview({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    document.getElementById('auth-title')?.focus();
  }, []);

  return (
    <Modal busy={false} onClose={onClose}>
      <Stack size="l">
        <Title id="auth-title" tabIndex={-1} className="text-center">
          Username recovery
        </Title>
        <p className="no-margin full-inline-size text-14 lh-130 text-secondary">
          Fill in your e-mail address and we will send you your username via
          e-mail. Contact us via support if you need further help.
        </p>
        <form
          noValidate
          aria-label="Username recovery preview"
          aria-describedby="username-recovery-notice"
          onSubmit={(event) => event.preventDefault()}
        >
          <Stack size="m">
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="Enter e-mail"
              autoComplete="email"
            />
            <Button variant="primary" size="m" className="full-inline-size">
              Send Login
            </Button>
            <p className="no-margin full-inline-size text-14 lh-130 text-secondary text-center">
              Check out our{' '}
              <Link as="button" variant="primary" className="text-underline">
                Live Chat
              </Link>
            </p>
          </Stack>
        </form>
      </Stack>
    </Modal>
  );
}
